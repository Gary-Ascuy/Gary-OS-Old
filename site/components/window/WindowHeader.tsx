import style from './WindowHeader.module.css'

export default function WindowHeader(): JSX.Element {
  return (
    <header className={style.header}>
      <section className={style.leftActions}>
        <button className={style.close}>
          <svg width='7' height='7' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              stroke='#000'
              strokeWidth='1.2'
              strokeLinecap='round'
              d='M1.182 5.99L5.99 1.182m0 4.95L1.182 1.323'
            />
          </svg>
        </button>

        <button className={style.min}>
          <svg width={7} height={2} fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path stroke='#000' strokeWidth={2} strokeLinecap='round' d='M.61.703h5.8' />
          </svg>
        </button>

        <button className={style.max}>
          {/* <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12.88 12.88'>
              <circle cx='6.44' cy='6.44' r='6.44' fill='none' />
              <path
                d='M6.5,3.34V9.66M9.66,6.5H3.34'
                fill='none'
                stroke='black'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='1.5'
              />
            </svg> */}
          <svg
            viewBox='0 0 13 13'
            xmlns='http://www.w3.org/2000/svg'
            fillRule='evenodd'
            clipRule='evenodd'
            strokeLinejoin='round'
            strokeMiterlimit='2'
          >
            <path d='M4.871 3.553L9.37 8.098V3.553H4.871zm3.134 5.769L3.506 4.777v4.545h4.499z' />
            <circle cx={6.438} cy={6.438} r={6.438} fill='none' />
          </svg>
        </button>
      </section>

      <section className={style.title} >gary -- -zsh -- 80x24</section>

      <section className={style.rightActions} ></section>
    </header>
  )
}
