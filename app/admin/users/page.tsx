import React from "react";
import UserManagementClient from "./UserManagementClient";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";

export default async function UserManagementPage() {
  // ดึงข้อมูลสมาชิกบนฝั่งเซิร์ฟเวอร์ (ใช้ cache: "no-store" เพื่อให้ได้ข้อมูลล่าสุด)
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/users`, {
    cache: "no-store",
  });
  const users = await res.json();

  return (
    <div className="min-h-screen pt-16 bg-gray-100">
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
          จัดการข้อมูลสมาชิก
        </h1>
        {/* ส่งข้อมูลสมาชิกที่ดึงได้ไปยัง Client Component */}
        <UserManagementClient initialUsers={users} />
      </main>
      <ScrollToTop />
    </div>
  );
}
