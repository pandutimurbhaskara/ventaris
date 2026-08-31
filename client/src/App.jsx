import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'

const heading = 'font-heading font-medium text-text-h'
const h1 = `${heading} my-5 text-[36px] tracking-[-1.68px] lg:my-8 lg:text-[56px]`
const h2 = `${heading} mb-2 text-xl leading-[118%] tracking-[-0.24px] lg:text-2xl`
const codeTag =
  'inline-flex rounded-[4px] bg-code-bg px-2 py-1 font-mono text-[15px] leading-[135%] text-text-h'
const panel = 'flex-1 px-5 py-6 lg:p-8'
// `inline align-baseline` opts out of Preflight's img/svg normalisation
// (display:block + vertical-align:middle); the original spacing below the
// icon includes the inline descender gap. Drop both to get the tighter look.
const sectionIcon = 'mb-4 inline align-baseline size-[22px]'
const chip =
  'flex w-full items-center justify-center gap-2 rounded-md bg-social-bg px-3 py-1.5 text-[16px] text-text-h no-underline transition-shadow duration-300 hover:shadow-card lg:w-auto lg:justify-start'
const chipItem = 'flex-[1_1_calc(50%-8px)] lg:flex-initial'
const buttonIcon = 'size-[18px]'
const ticks =
  "relative w-full before:absolute before:-top-[4.5px] before:left-0 before:border-[5px] before:border-y-transparent before:border-r-transparent before:border-l-border before:content-[''] after:absolute after:-top-[4.5px] after:right-0 after:border-[5px] after:border-y-transparent after:border-l-transparent after:border-r-border after:content-['']"

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="mx-auto flex min-h-svh w-[1126px] max-w-full flex-col border-x border-border text-center">
      <section
        id="center"
        className="flex grow flex-col place-content-center place-items-center gap-[18px] px-5 pt-8 pb-6 lg:gap-[25px] lg:p-0"
      >
        <div className="relative">
          <img
            src={heroImg}
            /* inline/align-baseline/h: see sectionIcon — keeps Preflight from
               reflowing the hero stack (block, vertical-align, height:auto). */
            className="relative z-0 mx-auto inline h-[179px] w-[170px] align-baseline"
            width="170"
            height="179"
            alt=""
          />
          <img
            src={reactLogo}
            className="absolute inset-x-0 top-[34px] z-1 mx-auto h-7 transform-[perspective(2000px)_rotateZ(300deg)_rotateX(44deg)_rotateY(39deg)_scale(1.4)]"
            alt="React logo"
          />
          <img
            src={viteLogo}
            className="absolute inset-x-0 top-[107px] z-0 mx-auto h-[26px] w-auto transform-[perspective(2000px)_rotateZ(300deg)_rotateX(40deg)_rotateY(39deg)_scale(0.8)]"
            alt="Vite logo"
          />
        </div>
        <div>
          <h1 className={h1}>Get started</h1>
          <p>
            Edit <code className={codeTag}>src/App.jsx</code> and save to test{' '}
            <code className={codeTag}>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="mb-6 inline-flex rounded-[5px] border-2 border-transparent bg-accent-bg px-2.5 py-[5px] font-mono text-[16px] leading-[normal] tracking-normal text-accent transition-colors duration-300 hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className={ticks}></div>

      <section
        id="next-steps"
        className="flex flex-col border-t border-border text-center lg:flex-row lg:text-left"
      >
        <div
          id="docs"
          className={`${panel} border-b border-border lg:border-r lg:border-b-0`}
        >
          <svg className={sectionIcon} role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2 className={h2}>Documentation</h2>
          <p>Your questions, answered</p>
          <ul className="mt-5 flex flex-wrap justify-center gap-2 lg:mt-8 lg:flex-nowrap lg:justify-start">
            <li className={chipItem}>
              <a href="https://vite.dev/" target="_blank" className={chip}>
                <img className="h-[18px]" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li className={chipItem}>
              <a href="https://react.dev/" target="_blank" className={chip}>
                <img className={buttonIcon} src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social" className={panel}>
          <svg className={sectionIcon} role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2 className={h2}>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul className="mt-5 flex flex-wrap justify-center gap-2 lg:mt-8 lg:flex-nowrap lg:justify-start">
            <li className={chipItem}>
              <a
                href="https://github.com/vitejs/vite"
                target="_blank"
                className={chip}
              >
                <svg
                  className={`${buttonIcon} dark:[filter:invert(1)_brightness(2)]`}
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li className={chipItem}>
              <a href="https://chat.vite.dev/" target="_blank" className={chip}>
                <svg
                  className={`${buttonIcon} dark:[filter:invert(1)_brightness(2)]`}
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li className={chipItem}>
              <a href="https://x.com/vite_js" target="_blank" className={chip}>
                <svg
                  className={`${buttonIcon} dark:[filter:invert(1)_brightness(2)]`}
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li className={chipItem}>
              <a
                href="https://bsky.app/profile/vite.dev"
                target="_blank"
                className={chip}
              >
                <svg
                  className={`${buttonIcon} dark:[filter:invert(1)_brightness(2)]`}
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className={ticks}></div>
      <section
        id="spacer"
        className="h-12 border-t border-border box-content lg:h-[88px]"
      ></section>
    </div>
  )
}

export default App
