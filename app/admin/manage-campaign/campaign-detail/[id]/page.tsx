import ScrollToTop from "@/components/ScrollToTop";
import Navbar from "@/components/Navbar";
import Client from "./Client";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  // ดึงข้อมูลรายการร่วมบุญ
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || ""}/api/campaign-transactions?id=${id}`,
    {
      cache: "no-store",
    }
  );
  const data = await res.json();

  return (
    <div className="min-h-screen pt-16 bg-gray-100">
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          รายการร่วมบุญ
        </h1>
        {/* ส่งข้อมูลไปยัง Client Component */}
        <Client initial={data} />
      </main>
      <ScrollToTop />
    </div>
  );
}
