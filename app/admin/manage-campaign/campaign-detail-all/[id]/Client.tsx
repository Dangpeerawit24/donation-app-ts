"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import ReactDOM from "react-dom/client";
import { X } from "lucide-react";
import Image from "next/image";
import * as XLSX from "xlsx";
import TopicSelect from "@/components/TopicSelect";

// ประกาศ interface สำหรับข้อมูล (ปรับให้ตรงกับโครงสร้างจริง)
export interface CampaignData {
  id: string;
  name: string;
  status: string;
  total_campaigns: number;
  total_value_price: number;
  campaign_img?: string;
  description?: string;
  price?: number;
  stock?: number;
  details?: string;
  respond?: string;

  // ด้านล่างคือฟิลด์ที่เห็นในตาราง (หากมีฟิลด์เพิ่มเติมก็ประกาศด้วย)
  slip?: string;
  detailsname?: string | null;
  detailswish?: string | null;
  detailsbirthdate?: string | null;
  detailsbirthmonth?: string | null;
  detailsbirthyear?: string | null;
  detailsbirthtime?: string | null;
  detailsbirthconstellation?: string | null;
  detailsbirthage?: string | null;
  detailstext?: string | null;
  value?: number;
  lineName?: string;
  qr_url?: string;
  form?: string;
  transactionID?: string;
}

// ประกาศ interface สำหรับ props ของ Client Component
interface ClientProps {
  // initial คือข้อมูลตั้งต้นของรายการ (เช่น แสดงในตาราง)
  initial: CampaignData[];
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

// เพิ่ม type ให้ global window สำหรับฟังก์ชัน handleDonationAllChange
declare global {
  interface Window {
    handleDonationAllChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    addCommas: () => void;
    addCommasWish: () => void;
  }
}

const Client: React.FC<ClientProps> = ({ initial }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  // อ่านพารามิเตอร์จาก URL
  const { id } = useParams() as { id?: string };

  // สร้าง state สำหรับเก็บรายการ (campaigns) และข้อมูลชื่อกองบุญ (namecampaign)
  const [campaigns, setCampaigns] = useState<CampaignData[]>(initial);
  // namecampaign เป็น single object (null ถ้ายังไม่มีข้อมูล)
  const [namecampaign, setNamecampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // ตรวจสอบสิทธิ์ (เฉพาะ admin)
  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user as any)?.role !== "admin") {
      Swal.fire({
        title: "ปฏิเสธการเข้าถึง",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
        icon: "error",
      }).then(() => router.push("/login"));
    }
  }, [session, status, router]);

  // ฟังก์ชันดึงข้อมูลรายการ (campaign-transactions) ตาม id
  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/campaign-transactions/all?id=${id}`);
      const data: CampaignData[] = await res.json();
      setCampaigns(data);
    } catch (error: any) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    }
    setLoading(false);
  };

  // ฟังก์ชันดึงข้อมูลชื่อกองบุญ (ถ้ามี API แยกสำหรับดึงชื่อ)
  const fetchName = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/campaign-transactions/name?id=${id}`);
      const data: CampaignData = await res.json();
      setNamecampaign(data);
    } catch (error: any) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    }
    setLoading(false);
  };

  // เรียก fetchData และ fetchName เมื่อ id เปลี่ยน
  useEffect(() => {
    fetchData();
    fetchName();
  }, [id]);

  // ประกาศฟังก์ชัน global สำหรับ Swal (addCommas, addCommasWish)
  if (typeof window !== "undefined") {
    window.addCommas = function () {
      const textarea = document.getElementById("swal-details") as HTMLTextAreaElement | null;
      const valueEl = document.getElementById("swal-value") as HTMLInputElement | null;
      if (!textarea || !valueEl) return;

      const lines = textarea.value.split("\n");
      const updatedLines = lines.map((line, index) =>
        line.trim() !== "" && index < lines.length - 1 ? `${line}/n/` : line
      );

      textarea.value = updatedLines.join("\n");
      valueEl.value = String(lines.length);
    };

    window.addCommasWish = function () {
      const textarea = document.getElementById("swal-detailswish") as HTMLTextAreaElement | null;
      const valueEl = document.getElementById("swal-value") as HTMLInputElement | null;
      if (!textarea || !valueEl) return;

      const lines = textarea.value.split("\n");
      const updatedLines = lines.map((line, index) =>
        line.trim() !== "" && index < lines.length - 1 ? `${line}/n/` : line
      );

      textarea.value = updatedLines.join("\n");
      valueEl.value = String(lines.length);
    };
  }

  // เพิ่มรายการร่วมบุญ
  const handleAddUser = async () => {
    const { value: formValues } = await Swal.fire({
      title: "เพิ่มรายการร่วมบุญ",
      html: `
        <div class="w-full max-w-lg mx-auto p-4">
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">รายนาม:</label>
            <textarea id="swal-details" rows="5" class="w-full p-2 border border-gray-300 rounded-lg" required></textarea>
            <button class="p-1 bg-blue-500 text-white rounded hover:bg-blue-600" onclick="addCommas()">แยกรายการ</button>
          </div>
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">คำขอพร:</label>
            <textarea id="swal-detailswish" rows="5" class="w-full p-2 border border-gray-300 rounded-lg"></textarea>
            <button class="p-1 bg-blue-500 text-white rounded hover:bg-blue-600" onclick="addCommasWish()">แยกรายการ</button>
          </div>
          <div class="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label class="block text-lg font-semibold mb-1">จำนวน:</label>
              <input id="swal-value" type="number" min="1" class="w-full p-2 border border-gray-300 rounded-lg" value="1" required />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-lg font-semibold mb-1">ชื่อไลน์:</label>
              <input id="swal-lineName" type="text" class="w-full p-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label class="block text-lg font-semibold mb-1">ที่มา:</label>
              <select id="swal-form" class="w-full p-2 border border-gray-300 rounded-lg">
                <option value="L">L</option>
                <option value="IB">IB</option>
                <option value="P">P</option>
              </select>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      focusConfirm: false,
      preConfirm: () => {
        const detailsEl = document.getElementById("swal-details") as HTMLTextAreaElement | null;
        const detailswishEl = document.getElementById("swal-detailswish") as HTMLTextAreaElement | null;
        const valueEl = document.getElementById("swal-value") as HTMLInputElement | null;
        const lineNameEl = document.getElementById("swal-lineName") as HTMLInputElement | null;
        const formEl = document.getElementById("swal-form") as HTMLSelectElement | null;

        if (!detailsEl || !valueEl || !lineNameEl || !formEl) {
          Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง!");
          return false;
        }

        const details = detailsEl.value.trim();
        const detailswish = detailswishEl?.value.trim() || "";
        const value = valueEl.value.trim();
        const lineName = lineNameEl.value.trim();
        const form = formEl.value.trim();

        if (!details || !value || !lineName || !form) {
          Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง!");
          return false;
        }

        return { details, detailswish, value, lineName, form };
      },
    });

    if (!formValues) return;

    try {
      if (!namecampaign) {
        throw new Error("ไม่พบข้อมูลกองบุญ");
      }

      // ใช้ FormData เพื่อรองรับการอัปโหลดไฟล์ (ถ้ามี)
      const formData = new FormData();
      formData.append("details", formValues.details);
      formData.append("detailswish", formValues.detailswish);
      formData.append("value", formValues.value);
      formData.append("lineName", formValues.lineName);
      formData.append("form", formValues.form);

      // ส่งข้อมูลชื่อกองบุญ
      formData.append("campaignsid", namecampaign.id);
      formData.append("campaignsname", namecampaign.name);
      formData.append("respond", namecampaign.respond || "");

      const res = await fetch("/api/campaign-transactions", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("เพิ่มรายการร่วมบุญไม่สำเร็จ");
      Swal.fire("สำเร็จ!", "เพิ่มรายการร่วมบุญใหม่แล้ว", "success");
      fetchData(); // รีเฟรชตารางหลังเพิ่มสำเร็จ
    } catch (error: any) {
      Swal.fire("เกิดข้อผิดพลาด!", error.message, "error");
    }
  };

  // ลบสมาชิก
  const handleDelete = async (deleteId: string) => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "ต้องการลบข้อมูลนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch("/api/campaign-transactions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: deleteId }),
        });

        if (!res.ok) throw new Error("ลบข้อมูลไม่สำเร็จ");
        Swal.fire("ลบสำเร็จ!", "ข้อมูลถูกลบแล้ว", "success");
        fetchData(); // รีเฟรชตารางหลังลบ
      } catch (error: any) {
        Swal.fire("เกิดข้อผิดพลาด!", error.message, "error");
      }
    }
  };

  // คัดลอกข้อมูลในตาราง
  const copyTable = () => {
    const table = document.getElementById("myTable") as HTMLTableElement | null;
    if (!table) return;

    const columnsToCopy = [0, 1, 2, 3, 4, 5, 6, 7];
    let textToCopy = "";
    const rows = table.querySelectorAll("tr");
    rows.forEach((row) => {
      const cells = row.querySelectorAll("th, td");
      const rowData: string[] = [];
      columnsToCopy.forEach((colIndex) => {
        const cell = cells[colIndex];
        const cellText = cell
          ? (cell as HTMLTableCellElement).innerText.replace(/\r?\n|\r/g, " ")
          : "";
        rowData.push(cellText);
      });
      textToCopy += rowData.join("\t") + "\n";
    });

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        Swal.fire({
          title: "คัดลอกไปยัง Clipboard แล้ว!",
          icon: "success",
          confirmButtonText: "ตกลง",
        });
      })
      .catch((err) => {
        Swal.fire({
          title: "คัดลอกไม่สำเร็จ",
          text: err.message,
          icon: "error",
          confirmButtonText: "ตกลง",
        });
      });
  };

  // ส่งออกตารางเป็น Excel
  const exportToExcel = () => {
    const table = document.getElementById("myTable") as HTMLTableElement | null;
    if (!table) return;
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
    XLSX.writeFile(wb, "myTableData.xlsx");
  };

  // แสดงรูปภาพใน Swal
  const imgswl = async (img: string) => {
    await Swal.fire({
      html: `
        <div class="flex flex-col items-end">
          <div id="close-btn-container"></div>
          <div class="flex flex-col items-center">
            <img class="rounded-lg shadow-lg max-w-full" src="${img}" alt="img" />
          </div>
        </div>
      `,
      showConfirmButton: false,
      didOpen: () => {
        const closeBtnContainer = document.getElementById("close-btn-container");
        if (closeBtnContainer) {
          const root = ReactDOM.createRoot(closeBtnContainer);
          root.render(
            <X
              size={28}
              id="close-btn"
              className="cursor-pointer text-gray-500 hover:text-gray-700"
              onClick={() => Swal.close()}
            />
          );
        }
      },
    });
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
      <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
        กองบุญ{namecampaign?.name}
      </h2>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={copyTable}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            คัดลอกข้อมูลในตาราง
          </button>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            บันทึกเป็น Excel
          </button>
          {namecampaign && (
            <button
              onClick={() =>
                (window.location.href = `/admin/manage-campaign/campaign-detail-succeed/${namecampaign.id}`)
              }
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              รายการที่กำเนิดการแล้ว
            </button>
          )}
        </div>
        <div>
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            + เพิ่มรายการร่วมบุญ
          </button>
        </div>
      </div>

      <div className="overflow-x-auto table-container table-fixed">
        <div className="overflow-auto rounded-lg shadow-lg">
          <table
            id="myTable"
            className="w-full table-fixed border-collapse bg-white rounded-lg"
          >
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-4 w-[2%] text-center">#</th>
                <th className="p-4 w-[5%] text-center">สลิป</th>
                <th className="p-4 text-start">ข้อมูลผู้ร่วมบุญ</th>
                <th className="p-4 text-start">คำขอพร</th>
                <th className="p-4 w-[5%] text-center">จำนวน</th>
                <th className="p-4 w-[10%] text-center">ชื่อไลน์</th>
                <th className="p-4 w-[10%] text-center">QR Url</th>
                <th className="p-4 w-[5%] text-center">ที่มา</th>
                <th className="p-4 w-[15%] text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, index) => (
                <tr key={campaign.id} className=" hover:bg-gray-100 transition">
                  <td className="p-4 text-center">{index + 1}</td>
                  <td className="p-4 text-center items-center">
                    <a
                      className="flex justify-center"
                      href="#"
                      onClick={() => imgswl(`${baseUrl}/${campaign.slip}`)}
                    >
                      <Image
                        className="w-12 h-12 object-cover rounded-md border border-gray-300 shadow-sm"
                        src={`${baseUrl}/${campaign.slip || ""}`}
                        alt="campaign"
                        width={48}
                        height={48}
                      />
                    </a>
                  </td>
                  <td className="p-4 text-nowrap truncate-text">
                    {/* ตัวอย่างการประมวลผลเงื่อนไข */}
                    {campaign.detailsname && !campaign.detailsbirthdate
                      ? campaign.detailsname
                      : ""}
                    {campaign.detailsname && campaign.detailswish
                      ? campaign.detailsname
                      : ""}
                    {campaign.detailsbirthdate ? (
                      <>
                        {campaign.detailsname}
                        <br />
                        {campaign.detailsbirthdate} {campaign.detailsbirthmonth}{" "}
                        {campaign.detailsbirthyear} เวลา {campaign.detailsbirthtime} ปี
                        {campaign.detailsbirthconstellation} อายุ {campaign.detailsbirthage} ปี
                      </>
                    ) : null}
                    {campaign.detailstext || ""}
                    {campaign.details || ""}
                  </td>
                  <td className="p-4 text-nowrap truncate-text">
                    {campaign.detailswish || ""}
                  </td>
                  <td className="p-4 text-center text-nowrap truncate-text">
                    {campaign.value}
                  </td>
                  <td className="p-4 text-center text-nowrap truncate-text">
                    {campaign.lineName}
                  </td>
                  <td className="p-4 text-center text-nowrap truncate-text">
                    {campaign.qr_url}
                  </td>
                  <td className="p-4 text-center text-nowrap truncate-text">
                    {campaign.form}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          (window.location.href = `/line/pushimages/${campaign.transactionID}`)
                        }
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        ส่งรูป
                      </button>
                      <button
                        onClick={() => handleDelete(campaign.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        ลบ
                      </button>
                    </div>
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

export default Client;
