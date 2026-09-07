function Group() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute bg-[#e899a6] left-0 size-[45px] top-0" />
      <div className="absolute bg-[#fef7f5] border border-black border-solid left-0 size-[45px] top-0" />
      <div className="absolute bg-white border border-black border-solid left-0 size-[45px] top-0" />
      <div className="absolute left-0 size-[45px] top-0">
        <svg className="absolute block inset-0 size-full" fill="none" height="45" preserveAspectRatio="none" viewBox="0 0 45 45" width="45">
          <path d="M0 0H45V45H0V0Z" fill="#4A4E4D" id="Rectangle 4" />
        </svg>
      </div>
      <div className="absolute bg-[#cd3a69] left-0 size-[45px] top-0" />
      <p className="[word-break:break-word] absolute font-['Inria_Serif:Regular',sans-serif] leading-[normal] left-0 not-italic text-[10px] text-black top-0 whitespace-nowrap">Primary</p>
      <p className="[word-break:break-word] absolute font-['Inria_Serif:Regular',sans-serif] leading-[normal] left-0 not-italic text-[10px] text-black top-0 whitespace-nowrap">Background</p>
      <p className="[word-break:break-word] absolute font-['Inria_Serif:Regular',sans-serif] leading-[normal] left-0 not-italic text-[10px] text-black top-0 whitespace-nowrap">Surface/Card</p>
      <p className="[word-break:break-word] absolute font-['Inria_Serif:Regular',sans-serif] leading-[normal] left-0 not-italic text-[10px] text-black top-0 whitespace-nowrap">Text Primary</p>
      <p className="[word-break:break-word] absolute font-['Inria_Serif:Regular',sans-serif] leading-[normal] left-0 not-italic text-[10px] text-black top-0 whitespace-nowrap">Alert/Danger</p>
    </div>
  );
}

export default function Group1() {
  return (
    <div className="contents relative size-full">
      <p className="[word-break:break-word] absolute font-['Inria_Serif:Regular',sans-serif] leading-[normal] left-0 not-italic text-[24px] text-black top-0 whitespace-nowrap">Option 1</p>
      <Group />
    </div>
  );
}