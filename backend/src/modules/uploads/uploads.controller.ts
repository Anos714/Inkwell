import { Context, Env } from "hono";
import { AppError } from "../../utils/AppError";
import { UploadType, uploadTypes } from "./uploads.type";
import { GifResolveInput } from "./gif-resolve.schema";
import cloudinary from "../../config/cloudinary";
import { env } from "../../config/env";

export const uploadImageController = async (c: Context) => {
  const payload = c.get("user");

  if (!payload) {
    throw AppError.Unauthorized("Unauthorized");
  }

  const type = c.req.query("type");

  if (!type || !Object.hasOwn(uploadTypes, type)) {
    throw AppError.BadRequest("A valid upload type is required");
  }

  const uploadType = type as UploadType;

  if (uploadType === "blogCover" && payload.role !== "admin") {
    throw AppError.Forbidden("Only admins can upload blog covers");
  }

  const { folder } = uploadTypes[uploadType];
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    env.CLOUDINARY_API_SECRET,
  );

  return c.json({
    success: true,
    data: {
      timestamp,
      signature,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      folder,
      maxSize: uploadTypes[uploadType].maxSize,
    },
  });
};

type GifResolveContext = Context<
  Env,
  string,
  { in: { json: GifResolveInput }; out: { json: GifResolveInput } }
>;

// Hosts that always serve raw media, even without a file extension.
const DIRECT_MEDIA_HOSTS = [
  "media.tenor.com",
  "media.giphy.com",
  "i.giphy.com",
  "i.imgur.com",
  "media.imgur.com",
];

// Share/short links on the main site hosts redirect to view pages,
// even when the path ends with .gif — never treat them as direct media.
const PAGE_HOSTS = ["tenor.com", "www.tenor.com", "giphy.com", "www.giphy.com"];

// media1.tenor.com … media4.tenor.com, media0.giphy.com … media4.giphy.com
const DIRECT_MEDIA_HOST_PATTERNS = [
  /^media\d\.tenor\.com$/,
  /^media\d\.giphy\.com$/,
];

const RESOLVE_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 512 * 1024;

const isVideoPath = (pathname: string) => /\.(mp4|webm)(\?.*)?$/i.test(pathname);
const isImagePath = (pathname: string) =>
  /\.(gif|webp|png|jpe?g|avif)(\?.*)?$/i.test(pathname);

const isDirectMediaUrl = (url: URL) => {
  const host = url.hostname.toLowerCase();
  if (PAGE_HOSTS.includes(host)) return false;
  if (isVideoPath(url.pathname) || isImagePath(url.pathname)) return true;
  return (
    DIRECT_MEDIA_HOSTS.some(
      (allowed) => host === allowed || host.endsWith(`.${allowed}`),
    ) || DIRECT_MEDIA_HOST_PATTERNS.some((pattern) => pattern.test(host))
  );
};

// Server-side fetch must never reach internal infrastructure.
const isBlockedHost = (hostname: string) => {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (["localhost", "0.0.0.0", "::1"].includes(host)) return true;
  if (/^127\./.test(host) || host === "2130706433" || host === "0x7f000001")
    return true;
  if (/^(10|169\.254)\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  if (/^(fc|fd)[0-9a-f:]*/.test(host) && host.includes(":")) return true;
  if (/^fe80:/.test(host)) return true;
  return false;
};

const readCappedText = async (
  response: Response,
  cap = MAX_HTML_BYTES,
): Promise<string> => {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let received = 0;
  let text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > cap) break;
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
  return text + decoder.decode();
};

// og:video wins over og:image; both attribute orders are accepted.
const extractOpenGraphMedia = (html: string): string | null => {
  const patterns = [
    /<meta[^>]+property=["']og:(video|image)(?::secure_url)?["'][^>]*?content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]*?property=["']og:(video|image)(?::secure_url)?["']/gi,
  ];
  let image: string | null = null;
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const kind = (match[1] ?? match[3] ?? "").toLowerCase();
      const content = match[2] ?? match[1] ?? "";
      if (!content) continue;
      if (kind === "video") return content;
      image ??= content;
    }
  }
  return image;
};

export const resolveGifController = async (c: GifResolveContext) => {
  const payload = c.get("user");
  if (!payload) throw AppError.Unauthorized("Unauthorized");

  const { url } = c.req.valid("json");
  const parsed = new URL(url);
  if (isBlockedHost(parsed.hostname)) {
    throw AppError.BadRequest("GIFs cannot be loaded from that host");
  }

  if (isDirectMediaUrl(parsed)) {
    return c.json({
      success: true,
      message: "GIF resolved successfully",
      data: {
        url,
        kind: isVideoPath(parsed.pathname) ? "video" : "image",
      },
    });
  }

  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(RESOLVE_TIMEOUT_MS),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Inkwell/1.0; +https://inkwell-blogs.pages.dev)",
        Accept: "text/html,application/xhtml+xml,image/*,video/*",
      },
    });
  } catch {
    throw AppError.BadRequest("That GIF link could not be opened");
  }

  if (!response.ok) {
    throw AppError.BadRequest("That GIF link could not be opened");
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.startsWith("image/") || contentType.startsWith("video/")) {
    return c.json({
      success: true,
      message: "GIF resolved successfully",
      data: {
        url,
        kind: contentType.startsWith("video/") ? "video" : "image",
      },
    });
  }

  const html = await readCappedText(response);
  const media = extractOpenGraphMedia(html);
  if (!media) {
    throw AppError.BadRequest("No embeddable GIF found at that link");
  }

  let absolute: string;
  try {
    absolute = new URL(media, url).toString();
  } catch {
    throw AppError.BadRequest("No embeddable GIF found at that link");
  }

  const resolved = new URL(absolute);
  if (resolved.protocol !== "https:" || isBlockedHost(resolved.hostname)) {
    throw AppError.BadRequest("No embeddable GIF found at that link");
  }

  return c.json({
    success: true,
    message: "GIF resolved successfully",
    data: {
      url: absolute,
      kind: isVideoPath(resolved.pathname) ? "video" : "image",
    },
  });
};
