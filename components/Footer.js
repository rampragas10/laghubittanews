export default function Footer() {
  return (
    <footer className="mt-16 bg-[#27313f] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4 md:px-8">
        <div>
          <h3 className="text-xl font-bold text-[#8cf9a9]">लघुवित्त न्युज</h3>
          <p className="mt-3 text-sm leading-7 opacity-80">
            नेपालका विपन्न तथा ग्रामीण भेगका नागरिकहरूलाई वित्तीय पहुँच, उद्यमशीलता र आर्थिक आत्मनिर्भरतर्फ प्रेरित गर्ने डिजिटल वित्तीय पत्रिका।
          </p>
          <div className="mt-4 space-y-1 text-xs opacity-70">
            <p>सूचना तथा प्रसारण विभाग दर्ता नं: १२३४/०७८-७९</p>
            <p>प्रेस काउन्सिल नेपाल सूचीकरण नं: ९८७/०७८</p>
            <p>सञ्चालक / सम्पादक: Laghubitta Media Group</p>
            <p>इमेल: media.intnepal@gmail.com</p>
            <p>फोन: ९७४१८०३६००</p>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-[#8cf9a9]">प्रमुख खण्डहरू</h4>
          <ul className="mt-4 space-y-2 text-sm opacity-85">
            <li>लघुवित्त समाचार</li><li>उद्यमशीलता</li><li>फोटो कथा</li><li>नीति तथा निर्देशन</li><li>सूचना तथा विज्ञापन</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[#8cf9a9]">नियमनकारी तथा वित्तीय निकायहरू</h4>
          <ul className="mt-4 space-y-2 text-sm opacity-85">
            <li>नेपाल राष्ट्र बैंक</li><li>नेपाल धितोपत्र बोर्ड (SEBON)</li><li>नेपाल स्टक एक्सचेन्ज (NEPSE)</li><li>नेपाल लघुवित्त बैंकर्स संघ</li><li>बीमा प्राधिकरण</li><li>सहकारी विभाग</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[#8cf9a9]">न्युजलेटर</h4>
          <p className="mt-4 text-sm opacity-80">दैनिक वित्तीय बजार तथा लघुवित्तका महत्वपूर्ण सूचना आफ्नो इमेलमा प्राप्त गर्नुहोस्।</p>
          <form className="mt-3 flex gap-2">
            <input className="min-w-0 flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm outline-none" placeholder="तपाईंको इमेल..." type="email" />
            <button className="rounded-lg bg-[#005b37] px-4 py-2 text-sm font-bold">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs opacity-70">
        © २०२४ लघुवित्त न्युज (Laghubitta News). सर्वाधिकार सुरक्षित।
      </div>
    </footer>
  );
}