export default function PangolinLogo({ size = 80, color = 'var(--color-primary)' }) {
  const id = `bc-${Math.random().toString(36).slice(2,7)}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <clipPath id={`clip-${id}`}>
          <ellipse cx="232" cy="218" rx="150" ry="146"/>
        </clipPath>
        <g id={`s-${id}`}>
          <path
            d="M 0 0 C -23 -2 -26 -36 0 -50 C 26 -36 23 -2 0 0Z"
            fill={color}
            stroke="#1a0900"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <line x1="0" y1="-4" x2="0" y2="-44" stroke="#1a0900" strokeWidth="0.9" opacity="0.55"/>
        </g>
      </defs>

      {/* Crescent arc */}
      <path d="M 349 68 A 190 190 0 1 0 349 368"
        fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"/>
      <path d="M 338 335 Q 400 275 400 218 Q 400 160 338 102"
        fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.45"/>

      {/* Body base */}
      <ellipse cx="232" cy="218" rx="150" ry="146" fill={color}/>

      {/* Scales */}
      <g clipPath={`url(#clip-${id})`}>
        {/* Ring 1 */}
        <use xlinkHref={`#s-${id}`} transform="translate(232,180) rotate(0)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(265,199) rotate(60)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(265,237) rotate(120)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(232,256) rotate(180)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(199,237) rotate(240)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(199,199) rotate(300)"/>
        {/* Ring 2 */}
        <use xlinkHref={`#s-${id}`} transform="translate(232,146) rotate(0)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(283,167) rotate(45)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(304,218) rotate(90)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(283,269) rotate(135)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(232,290) rotate(180)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(181,269) rotate(225)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(160,218) rotate(270)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(181,167) rotate(315)"/>
        {/* Ring 3 */}
        <use xlinkHref={`#s-${id}`} transform="translate(232,112) rotate(0)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(285,125) rotate(30)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(324,165) rotate(60)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(338,218) rotate(90)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(324,271) rotate(120)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(285,311) rotate(150)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(232,324) rotate(180)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(179,311) rotate(210)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(140,271) rotate(240)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(126,218) rotate(270)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(140,165) rotate(300)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(179,125) rotate(330)"/>
        {/* Ring 4 */}
        <use xlinkHref={`#s-${id}`} transform="translate(232,82) rotate(0)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(284,94) rotate(22)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(328,122) rotate(45)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(357,166) rotate(67)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(368,218) rotate(90)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(357,270) rotate(112)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(328,314) rotate(135)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(284,342) rotate(157)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(232,354) rotate(180)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(180,342) rotate(202)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(136,314) rotate(225)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(107,270) rotate(247)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(96,218) rotate(270)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(107,166) rotate(292)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(136,122) rotate(315)"/>
        <use xlinkHref={`#s-${id}`} transform="translate(180,94) rotate(337)"/>
      </g>

      {/* Head */}
      <ellipse cx="318" cy="148" rx="36" ry="25" fill={color} stroke="#1a0900" strokeWidth="1.8"
        transform="rotate(-18,318,148)"/>
      <path d="M 330 136 Q 360 140 373 150 Q 369 163 353 167 Q 334 168 324 160 Q 318 154 320 148 Z"
        fill={color} stroke="#1a0900" strokeWidth="1.8" strokeLinejoin="round"/>
      <ellipse cx="370" cy="153" rx="4" ry="3" fill="#b08030" stroke="#1a0900" strokeWidth="1"/>
      <ellipse cx="327" cy="144" rx="5" ry="4.5" fill="#1a0900"/>
      <circle cx="328.5" cy="143" r="1.8" fill="#e8d5a8" opacity="0.65"/>
      <path d="M 300 137 Q 318 132 336 139" stroke="#1a0900" strokeWidth="1.1" fill="none" opacity="0.5"/>
      <path d="M 296 150 Q 314 145 332 151" stroke="#1a0900" strokeWidth="1.1" fill="none" opacity="0.5"/>
      <path d="M 304 136 Q 309 120 320 126" fill="none" stroke="#1a0900" strokeWidth="2" strokeLinecap="round"/>

      {/* Tail */}
      <path d="M 342 308 Q 384 278 390 248 Q 394 220 380 196"
        stroke={color} strokeWidth="13" fill="none" strokeLinecap="round"/>
      <path d="M 344 315 Q 378 288 382 260 Q 385 236 374 214"
        stroke="#a07028" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.65"/>
      <path d="M 377 202 Q 387 190 380 181 Q 371 190 377 202Z"
        fill={color} stroke="#1a0900" strokeWidth="1.5"/>
      <path d="M 387 222 Q 398 210 393 200 Q 383 210 387 222Z"
        fill={color} stroke="#1a0900" strokeWidth="1.5"/>

      {/* 4-pointed star */}
      <path d="M 393 100 L 398 116 L 414 121 L 398 126 L 393 142 L 388 126 L 372 121 L 388 116 Z"
        fill={color}/>
    </svg>
  )
}
