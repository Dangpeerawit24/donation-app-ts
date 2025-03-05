import ScrollToTop from "@/components/ScrollToTop";
import Navbar from "@/components/Navbar";
import Client from "./Client";

const page = async () => {

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || ""}/api/campaigns`,
    {
      cache: "no-store",
    }
  );
  const data = await res.json();

  return (
    <div className="min-h-screen pt-16 bg-gray-100">
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
          จัดการข้อมูลกองบุญ
        </h1>
        {/* ส่งข้อมูลหัวข้อที่ดึงได้ไปยัง Client Component */}
        <Client initial={data} />
      </main>
      <ScrollToTop />
    </div>
  )
}
export default page