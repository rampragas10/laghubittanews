import Link from "next/link";
import DateTime from "./DateTime";

const nav = [
  ["गृहपृष्ठ", "/"],
  ["लघुवित्त सूची", "/category/microfinance-list"],
  ["लघुवित्त विशेष", "/category/microfinance-special"],
  ["लघुवित्त समाचार", "/category/microfinance-news"],
  ["विचार", "/category/opinion-and-editorial"],
  ["उद्यमशीलता", "/category/entrepreneurship"],
  ["अन्तरवार्ता", "/category/interviews"],
  ["फोटो कथा", "/category/photo-stories"],
  ["राष्ट्रिय नीति", "/category/national-policy"],
];

export default function Header() {
  return (
    <header>
      <div className="bg-[#005b37] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-xs md:px-8">
          <DateTime />
          <span className="hidden md:block">ताजा अपडेट: वित्तीय तथा लघुवित्त क्षेत्रका महत्वपूर्ण समाचार</span>
          <span>नेपाली | <span className="opacity-70">EN</span></span>
        </div>
      </div>

      <div className="bg-white py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="https://laghubittanews.com/wp-content/uploads/2024/07/Laghubitta-Final-1536x380-1.jpg" alt="Logo" className="h-20 w-auto" />
              
            
          </Link>
          <div className="hidden h-[90px] w-[728px] items-center justify-center rounded-lg bg-[#eff4ff] text-center text-xs text-gray-500 lg:flex">
            विज्ञापन / Advertisement (728x90)
          </div>
          {/* <Link href="/admin" className="rounded-full bg-[#005b37] p-2 text-white" title="Admin">
            ●
          </Link> */}
        </div>
      </div>

      <div className="sticky top-0 z-50 bg-[#006d36] shadow-md">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 md:px-8">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-white hover:bg-[#005b37]">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}