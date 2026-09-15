import type { MetadataRoute } from "next";
import { NAV } from "@/content/site";
import { fetchJobOrders } from "@/lib/publicApi";

const BASE_URL = "https://xklddieuduong.vn";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["/", ...NAV.map((item) => item.href)].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  // Trang chi tiết đơn hàng thay đổi thường xuyên hơn và cũng là thứ người ta
  // tìm nhiều nhất, nên khai báo riêng thay vì để công cụ tìm kiếm tự dò.
  const orders = await fetchJobOrders({ limit: 100 });
  const orderPages = orders.map((order) => ({
    url: `${BASE_URL}/don-hang/${order.code}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...orderPages];
}
