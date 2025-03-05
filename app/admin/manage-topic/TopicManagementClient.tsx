"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

// กำหนด Interface สำหรับหัวข้อ
interface Topic {
  id: string;
  name: string;
  status: string;
  total_campaigns: number;
  total_value_price: number;
}

// กำหนด Interface สำหรับ props ที่รับเข้ามา
interface TopicManagementClientProps {
  initialTopics: Topic[];
}

const TopicManagementClient = ({ initialTopics }: TopicManagementClientProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || (session.user && (session.user as any).role !== "admin")) {
      Swal.fire({
        title: "ปฏิเสธการเข้าถึง",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
        icon: "error",
      }).then(() => router.push("/login"));
    }
  }, [session, status, router]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/topics");
      const data: Topic[] = await res.json();
      setTopics(data);
    } catch (error: any) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลหัวข้อ:", error);
    }
    setLoading(false);
  };

  const handleAddTopics = async () => {
    const { value: formValues } = await Swal.fire({
      title: "เพิ่มหัวข้อใหม่",
      html: `
        <div class="w-full max-w-lg mx-auto p-4">
          <!-- ชื่อหัวข้อ -->
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">ชื่อหัวข้อ:</label>
            <input id="swal-name" class="w-full p-3 border border-gray-300 rounded-lg" placeholder="กรอกชื่อหัวข้อ" required />
          </div>
          <!-- สถานะ -->
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">สถานะ:</label>
            <select id="swal-role" class="w-full p-3 border border-gray-300 rounded-lg">
              <option value="อยู่ในช่วงงาน">อยู่ในช่วงงาน</option>
              <option value="จบงานแล้ว">จบงานแล้ว</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      focusConfirm: false,
      preConfirm: () => {
        const name = (document.getElementById("swal-name") as HTMLInputElement)
          .value.trim();
        const status = (document.getElementById("swal-role") as HTMLSelectElement)
          .value.trim();

        if (!name || !status) {
          Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง!");
          return false;
        }

        return { name, status };
      },
    });

    if (!formValues) return;

    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      if (!res.ok) throw new Error("เพิ่มข้อมูลไม่สำเร็จ");
      Swal.fire("สำเร็จ!", "เพิ่มข้อมูลใหม่แล้ว", "success");
      fetchTopics();
    } catch (error: any) {
      Swal.fire("เกิดข้อผิดพลาด!", error.message, "error");
    }
  };

  const handleDeleteTopic = async (id: string) => {
    const numericId = Number(id); // แปลง id เป็นตัวเลข

    if (isNaN(numericId) || numericId <= 0) {
      Swal.fire("เกิดข้อผิดพลาด!", "ID ไม่ถูกต้อง", "error");
      return;
    }

    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "ต้องการลบข้อมูลนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch("/api/topics", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: numericId }),
        });

        const data = await res.json();

        if (!res.ok)
          throw new Error(data.message || "ลบข้อมูลไม่สำเร็จ");

        Swal.fire("ลบสำเร็จ!", "ข้อมูลถูกลบแล้ว", "success");
        fetchTopics();
      } catch (error: any) {
        Swal.fire("เกิดข้อผิดพลาด!", error.message, "error");
      }
    }
  };

  const handleEditTopic = async (topic: Topic) => {
    const { value: formValues } = await Swal.fire({
      title: "แก้ไขข้อมูลหัวข้อ",
      html: `
        <div class="w-full max-w-lg mx-auto p-4">
          <!-- ชื่อหัวข้อ -->
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">ชื่อหัวข้อ:</label>
            <input id="swal-name" class="w-full p-3 border border-gray-300 rounded-lg" value="${topic.name}" required />
          </div>
          <!-- สถานะ -->
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">สถานะ:</label>
            <select id="swal-status" class="w-full p-3 border border-gray-300 rounded-lg">
              <option value="อยู่ในช่วงงาน" ${
                topic.status === "อยู่ในช่วงงาน" ? "selected" : ""
              }>อยู่ในช่วงงาน</option>
              <option value="จบงานแล้ว" ${
                topic.status === "จบงานแล้ว" ? "selected" : ""
              }>จบงานแล้ว</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      focusConfirm: false,
      preConfirm: () => {
        const id = Number(topic.id);
        const name = (document.getElementById("swal-name") as HTMLInputElement)
          .value.trim();
        const status = (document.getElementById("swal-status") as HTMLSelectElement)
          .value.trim();

        if (!id || !status || !name) {
          Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง!");
          return false;
        }

        return { id, name, status };
      },
    });

    if (!formValues) return;

    try {
      const res = await fetch("/api/topics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      if (!res.ok) throw new Error("แก้ไขข้อมูลไม่สำเร็จ");
      Swal.fire("บันทึกสำเร็จ!", "ข้อมูลหัวข้อถูกอัปเดตแล้ว", "success");
      fetchTopics();
    } catch (error: any) {
      Swal.fire("เกิดข้อผิดพลาด!", error.message, "error");
    }
  };

  if (loading) {
    return (
      <div
        id="loader"
        className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50"
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-dashed rounded-full animate-spin"></div>
          <p className="mt-4 text-blue-400 text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddTopics}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          + เพิ่มหัวข้อใหม่
        </button>
      </div>

      <div className="overflow-x-auto table-container table-fixed">
        <div className="overflow-auto rounded-lg shadow-lg">
          <table
            id="myTable"
            className="w-full table-fixed border-collapse bg-white rounded-lg"
          >
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-4 w-[5%] text-center">#</th>
                <th className="p-4 text-left">ชื่อ</th>
                <th className="p-4 w-[15%] text-center">
                  จำนวนกองบุญที่เปิด
                </th>
                <th className="p-4 w-[15%] text-center">
                  ยอดรวมรายได้
                </th>
                <th className="p-4 w-[15%] text-center">สถานะ</th>
                <th className="p-4 w-[25%] text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic, index) => (
                <tr key={topic.id} className="hover:bg-gray-100 transition">
                  <td className="p-4 text-center">{index + 1}</td>
                  <td className="p-4">{topic.name}</td>
                  <td className="p-4 text-center">
                    {topic.total_campaigns}
                  </td>
                  <td className="p-4 text-center">
                    {topic.total_value_price}
                  </td>
                  <td className="p-4 text-center">{topic.status}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() =>
                        (window.location.href = `/admin/topic-detail/${topic.id}`)
                      }
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-2"
                    >
                      รายการกองบุญ
                    </button>
                    <button
                      onClick={() => handleEditTopic(topic)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 mr-2"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDeleteTopic(topic.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default TopicManagementClient;
