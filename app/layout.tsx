import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper"; 

export const metadata: Metadata = {
  title: "ระบบจัดการกองบุญออนไลน์",
  description: "ระบบจัดการกองบุญออนไลน์ วิหารพระโพธิสัตว์กวนอิมทุ่งพิชัย",
  icons: {
    icon: "/icon.png",
  },
};

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <html>
      <body>
        <main className=''>
          <SessionWrapper>{children}</SessionWrapper>
        </main>
      </body>
    </html>
  );
};

export default layout;
