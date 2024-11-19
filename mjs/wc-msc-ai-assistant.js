import { _wcl } from './common-lib.js';
import { _wccss } from './common-css.js';
import Mustache from './mustache.js';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';
import 'https://unpkg.com/dompurify/dist/purify.min.js';
import 'https://unpkg.com/msc-circle-progress/mjs/wc-msc-circle-progress.js';
/*
 reference:
 - Built-in AI: https://developer.chrome.com/docs/ai/built-in
 - Built-in AI Early Preview Program: https://docs.google.com/document/d/18otm-D9xhn_XyObbQrc1v7SI-7lBX3ynZkjEpiS1V04/edit?tab=t.0
 - Prompt API: https://docs.google.com/document/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c/edit?tab=t.0#heading=h.drihdh1gpv8p
 - MDN text-wrap: https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap
 - MDN popover: https://developer.mozilla.org/en-US/docs/Web/API/Popover_API
 - MDN Using the Popover API: https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using
 - discrete property transitions: https://developer.chrome.com/blog/whats-new-css-ui-2023#discrete_property_transitions
 - Creating an Auto-Scrollable Element with CSS: https://albyianna.medium.com/creating-an-auto-scrollable-element-with-css-b7d814c73522
 - More control over :nth-child() selections with the of S syntax: https://developer.chrome.com/docs/css-ui/css-nth-child-of-s
 - marked: https://github.com/markedjs/marked
 - Document Picture-in-Picture API: https://developer.chrome.com/docs/web-platform/document-picture-in-picture
 - DOMPurify: https://github.com/cure53/DOMPurify
 - HTMLInputElement: selectionEnd property: https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/selectionEnd
 - https://stackoverflow.com/questions/48448718/insert-a-new-line-after-current-position-in-a-textarea
 */

const defaults = {
  config: {
    // systemPrompt, temperature, topK
  },
  l10n: {
    subject: 'AI Assistant',
    placeholder: 'Ask Gemini',
    error: 'Something wrong. Try again please.'
  },
  pip: false
};

const booleanAttrs = ['pip']; // booleanAttrs default should be false
const objectAttrs = ['config', 'l10n'];
const custumEvents = {
  error: 'msc-ai-assistant-error'
};
const NS = window.ai?.languageModel ? 'languageModel' : 'assistant';

const template = document.createElement('template');
template.innerHTML = `
<style>
${_wccss}

:host {
  position:relative;
  inline-size: 0;
  block-size: 0;
  overflow: hidden;

  @media (display-mode: picture-in-picture) {
    .main {
      .ai-assistant {
        --assistant-inline-size: 100dvi;
        --assistant-block-size: 100dvb;
        --assistant-inset-inline-start: 0px;
        --assistant-inset-block-start: 0px;
        --assistant-duration: 0ms;
      }

      .ai-assistant__head__close {
        display: none;
      }
    }
  }
}

.main {
  .ai-assistant {
    --padding-inline: 16px;
    --padding-block-start: 6px;
    --padding-block-end: var(--padding-inline);
    
    --line-color: var(--msc-ai-assistant-line-color, rgba(199 205 210));
    
    --close-icon-color: var(--msc-ai-assistant-close-icon-color, rgba(95 99 104));
    --close-hover-background-color: var(--msc-ai-assistant-close-hover-background-color, rgba(245 248 250));
    --close-size: 40;
    --close-size-with-unit: calc(var(--close-size) * 1px);
    --close-mask: path('M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z');
    --close-icon-scale: calc((var(--close-size) * .6) / 24);

    --head-font-size: 1.125em;

    --assistant-background-color: var(--msc-ai-assistant-background-color, rgba(255 255 255));
    --assistant-subject-color: var(--msc-ai-assistant-head-text-color, rgba(35 42 49));
    --assistant-content-color: var(--msc-ai-assistant-content-text-color, rgba(35 42 49));
    --assistant-content-highlight-color: var(--msc-ai-assistant-content-highlight-text-color, rgba(68 71 70));
    --assistant-content-highlight-background-color: var(--msc-ai-assistant-content-highlight-background-color, rgba(233 238 246));
    --assistant-content-pre-background-color: var(--msc-ai-assistant-content-group-background-color, rgba(241 244 248));

    --assistant-input-color: var(--msc-ai-assistant-input-text-color, rgba(31 31 31));
    --assistant-input-placeholder-color: var(--msc-ai-assistant-input-placeholder-text-color, rgba(95 99 103));
    --assistant-form-background-color: var(--msc-ai-assistant-form-background-color, rgba(240 244 248));
    --assistant-form-focus-background-color: var(--msc-ai-assistant-form-focus-background-color, rgba(233 238 246));

    --assistant-submit-icon-color: var(--msc-ai-assistant-submit-icon-color, rgba(68 71 70));
    --assistant-submit-hover-background-color: var(--msc-ai-assistant-submit-hover-background-color, rgba(0 0 0/.07));

    --assistant-inline-size: var(--msc-ai-assistant-inline-size, 400px);
    --assistant-block-size: var(--msc-ai-assistant-block-size, 600px);
    --assistant-inset-inline-start: var(--msc-ai-assistant-inset-inline-start, 16px);
    --assistant-inset-block-start: var(--msc-ai-assistant-inset-block-start, 16px);
    --assistant-box-shadow: var(--msc-ai-assistant-box-shadow, none);
    --assistant-z-index: var(--msc-ai-assistant-z-index, 1000);

    --assistant-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    --assistant-duration: 750ms;

    --body-block-size: calc(
      var(--assistant-block-size)
      - var(--padding-block-start)
      - var(--padding-block-end)
      - (var(--close-size-with-unit) + 1px)
    );

    inline-size: var(--assistant-inline-size);
    block-size: fit-content;
    inset-inline-start: var(--assistant-inset-inline-start);
    inset-block-start: var(--assistant-inset-block-start);

    border-radius: .5em;
    background-color: var(--assistant-background-color);
    box-sizing: border-box;
    box-shadow: var(--assistant-box-shadow);
    border: 0 none;
    outline: 0 none;

    padding-inline: var(--padding-inline);
    padding-block-start: var(--padding-block-start);
    padding-block-end: var(--padding-inline);

    /* popover animation */
    &:popover-open {
      opacity: 1;
    }

    opacity: 0;

    will-change: inline-size,inset-inline-start,inset-block-start,opacity,display;
    transition:
      inline-size var(--assistant-duration) var(--assistant-timing-function),
      inset-inline-start var(--assistant-duration) var(--assistant-timing-function),
      inset-block-start var(--assistant-duration) var(--assistant-timing-function),
      opacity var(--assistant-duration) var(--assistant-timing-function),
      display var(--assistant-duration) allow-discrete;

    z-index: var(--assistant-z-index);

    @starting-style {
      &:popover-open {
        opacity: 0;
      }
    }

    .ai-assistant__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-block-end: 1px solid var(--line-color);

      .ai-assistant__head__p {
        font-size: var(--head-font-size);
        color: var(--assistant-subject-color);
        line-height: var(--close-size-with-unit);
      }

      .ai-assistant__head__close {
        --background-color-normal: rgba(255 255 255/0);
        --background-color-active: var(--close-hover-background-color);
        --background-color: var(--background-color-normal);

        font-size: 0;
        position: relative;
        inline-size: var(--close-size-with-unit);
        aspect-ratio: 1/1;
        appearance: none;
        border: 0 none;
        border-radius: var(--close-size-with-unit);
        outline: 0 none;
        background-color: var(--background-color);
        transition: background-color 200ms ease;
        will-change: background-color;
        z-index: 1;

        &::before {
          position: absolute;
          inset-inline: 0 0;
          inset-block: 0 0;
          margin: auto;
          inline-size: 24px;
          block-size: 24px;
          content: '';
          background-color: var(--close-icon-color);
          clip-path: var(--close-mask);
          scale: var(--close-icon-scale);
        }

        &:active {
          scale: .8;
        }

        &:focus {
          --background-color: var(--background-color-active);
        }

        @media (hover: hover) {
          &:hover {
            --background-color: var(--background-color-active);
          }
        }
      }
    }

    .ai-assistant__body {
      --gap: 1em;
      --mask-vertical-size: var(--gap);
      --mask-vertical: linear-gradient(
        to bottom,
        transparent 0%,
        black calc(0% + var(--mask-vertical-size)),
        black calc(100% - var(--mask-vertical-size)),
        transparent 100%
      );

      --input-field-min-block-size: 3em;
      --sparkle-animation-duration: 0ms;

      position: relative;
      block-size: 600px;
      block-size: var(--body-block-size);

      will-change: block-size;
      transition: block-size var(--assistant-duration) ease;

      &:has([inert]) {
        :nth-last-child(1 of .result-unit) {
          --sparkle-animation-duration: 2.5s;
        }
      }

      .ai-assistant__body__form {
        --icon-send: path('M3,20V4l19,8L3,20ZM5,17l11.9-5L5,7v3.5l6,1.5-6,1.5v3.5ZM5,17V7v10Z');

        --background-color-normal: var(--assistant-form-background-color);
        --background-color-active: var(--assistant-form-focus-background-color);
        --background-color: var(--background-color-normal);

        --border-radius-normal: var(--input-field-min-block-size);
        --border-radius-active: .75em;
        --border-radius: var(--border-radius-normal);

        --submit-background-color-normal: rgba(0 0 0/0);
        --submit-background-color-active: var(--assistant-submit-hover-background-color);
        --submit-background-color: var(--submit-background-color-normal);

        position: absolute;
        inset-inline-start: 0px;
        inset-block-end: 0px;
        inline-size: 100%;
        block-size: fit-content;
        min-block-size: var(--input-field-min-block-size);
        background-color: var(--background-color);
        border-radius: var(--border-radius);
        display: block;
        box-sizing: border-box;
        padding-inline: 1em .25em;
        display: flex;
        align-items: flex-end;
        will-change: background-color,border-radius;
        transition: background-color 200ms ease,border-radius 200ms ease;

        &:focus-within {
          --background-color: var(--background-color-active);
        }

        &:not(:has(:placeholder-shown)) {
          --border-radius: var(--border-radius-active);
        }

        .ai-assistant__body__form__submit {
          flex-shrink: 0;
          font-size: 0;
          appearance: none;
          box-shadow: unset;
          border: unset;
          background: transparent;
          -webkit-user-select: none;
          user-select: none;
          pointer-events: auto;
          margin: 0;
          padding: 0;
          outline: 0 none;

          position: relative;
          inline-size: 36px;
          aspect-ratio: 1/1;
          border-radius: 36px;
          background-color: var(--submit-background-color);
          display: block;
          margin-block-end: 6px;
          will-change: background-color;
          transition: background-color 200ms ease;

          &:active {
            scale: .8;
          }

          @media (hover: hover) {
            &:hover {
              --submit-background-color: var(--submit-background-color-active);
            }
          }

          &::before {
            position: absolute;
            inset-inline-start: 50%;
            inset-block-start: 50%;
            margin-inline-start: -12px;
            margin-block-start: -12px;

            content: '';
            inline-size: 24px;
            aspect-ratio: 1/1;
            display: block;
            background-color: var(--assistant-submit-icon-color);
            clip-path: var(--icon-send);
          }
        }

        .ai-assistant__body__form__textarea {
          color: var(--assistant-input-color);

          block-size: min-content;
          max-block-size: calc(24px * 8);
          field-sizing: content;
          line-height: 24px;
          margin-block: 12px;

          flex-grow: 1;
          appearance: none;
          background: transparent;
          border: 0 none;
          box-sizing: border-box;
          outline: 0 none;
          resize: none;

          &::placeholder {
            color: var(--assistant-input-placeholder-color);
          }
        }
      }

      .ai-assistant__body_autoscroll {
        /* scroll */
        --scrollbar-inline-size: 2px;
        --scrollbar-block-size: 2px;
        --scrollbar-background: transparent;
        --scrollbar-thumb-color: rgba(0 0 0/.2);
        --scrollbar-thumb: var(--scrollbar-thumb-color);

        inline-size: 100%;
        block-size: 100%;
        padding-block: var(--gap);
        padding-inline-end: calc(var(--scrollbar-inline-size) * 2);

        display: flex;
        flex-direction: column-reverse;

        overflow: hidden;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;

        box-sizing: border-box;
        mask-image: var(--mask-vertical);
        -webkit-mask-image: var(--mask-vertical);

        &::-webkit-scrollbar {
          inline-size: var(--scrollbar-inline-size);
          block-size: var(--scrollbar-block-size);
        }

        &::-webkit-scrollbar-track {
          background: var(--scrollbar-background);
        }

        &::-webkit-scrollbar-thumb {
          border-radius: var(--scrollbar-block-size);
          background: var(--scrollbar-thumb);
        }

        .ai-assistant__body_autoscroll__results {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4em;

          &:last-child {
            margin-block-end: calc(var(--input-field-min-block-size) + 1em);
          }

          &:empty {
            inline-size: 100%;
            block-size: 100%;
            display: grid;
            place-content: center;

            &::before {
              content: 'Hello there';
              font-size: 2.5em;
              font-family: system-ui,sans-serif;
              background: linear-gradient(to right, rgba(84 129 236), rgba(213 102 118));
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              text-shadow: none;
            }
          }
        }
      }

      .result-unit {
        inline-size: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 1em;

        .result-unit__ask {
          max-inline-size: 80%;

          color: rgba(255 255 255);
          line-height: 1.3;
          padding-inline: .75em;
          padding-block: .5em;

          background-attachment: fixed;
          background-image: linear-gradient(#aa00ff, #0080ff);

          border-radius: 1.5em;
          border-end-end-radius: 6px;

          box-sizing: border-box;
          align-self: flex-end;
        }

        .result-unit__reply {
          --sparkle-size: 28px;

          min-block-size: var(--sparkle-size);
          box-sizing: border-box;
          
          display: flex;
          gap: .25em;
          align-items: flex-start;

          &::before {
            flex-shrink: 0;
            content: '';
            inline-size: var(--sparkle-size);
            aspect-ratio: 1/1;
            background: 0% 0% / var(--sparkle-size) var(--sparkle-size) no-repeat url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE0IDI4QzE0IDI2LjA2MzMgMTMuNjI2NyAyNC4yNDMzIDEyLjg4IDIyLjU0QzEyLjE1NjcgMjAuODM2NyAxMS4xNjUgMTkuMzU1IDkuOTA1IDE4LjA5NUM4LjY0NSAxNi44MzUgNy4xNjMzMyAxNS44NDMzIDUuNDYgMTUuMTJDMy43NTY2NyAxNC4zNzMzIDEuOTM2NjcgMTQgMCAxNEMxLjkzNjY3IDE0IDMuNzU2NjcgMTMuNjM4MyA1LjQ2IDEyLjkxNUM3LjE2MzMzIDEyLjE2ODMgOC42NDUgMTEuMTY1IDkuOTA1IDkuOTA1QzExLjE2NSA4LjY0NSAxMi4xNTY3IDcuMTYzMzMgMTIuODggNS40NkMxMy42MjY3IDMuNzU2NjcgMTQgMS45MzY2NyAxNCAwQzE0IDEuOTM2NjcgMTQuMzYxNyAzLjc1NjY3IDE1LjA4NSA1LjQ2QzE1LjgzMTcgNy4xNjMzMyAxNi44MzUgOC42NDUgMTguMDk1IDkuOTA1QzE5LjM1NSAxMS4xNjUgMjAuODM2NyAxMi4xNjgzIDIyLjU0IDEyLjkxNUMyNC4yNDMzIDEzLjYzODMgMjYuMDYzMyAxNCAyOCAxNEMyNi4wNjMzIDE0IDI0LjI0MzMgMTQuMzczMyAyMi41NCAxNS4xMkMyMC44MzY3IDE1Ljg0MzMgMTkuMzU1IDE2LjgzNSAxOC4wOTUgMTguMDk1QzE2LjgzNSAxOS4zNTUgMTUuODMxNyAyMC44MzY3IDE1LjA4NSAyMi41NEMxNC4zNjE3IDI0LjI0MzMgMTQgMjYuMDYzMyAxNCAyOFoiIGZpbGw9InVybCgjcGFpbnQwX3JhZGlhbF8xNjc3MV81MzIxMikiLz4KPGRlZnM+CjxyYWRpYWxHcmFkaWVudCBpZD0icGFpbnQwX3JhZGlhbF8xNjc3MV81MzIxMiIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgyLjc3ODc2IDExLjM3OTUpIHJvdGF0ZSgxOC42ODMyKSBzY2FsZSgyOS44MDI1IDIzOC43MzcpIj4KPHN0b3Agb2Zmc2V0PSIwLjA2NzEyNDYiIHN0b3AtY29sb3I9IiM5MTY4QzAiLz4KPHN0b3Agb2Zmc2V0PSIwLjM0MjU1MSIgc3RvcC1jb2xvcj0iIzU2ODREMSIvPgo8c3RvcCBvZmZzZXQ9IjAuNjcyMDc2IiBzdG9wLWNvbG9yPSIjMUJBMUUzIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==");
            display: block;

            animation: rolling-sparkle var(--sparkle-animation-duration) linear infinite;
          }

          .result-unit__reply__p {
            color: var(--assistant-content-color);
            line-height: 1.3;
            padding-block-start: .225em;

            strong {
              font-weight: 700;
            }

            ul, ol {
              list-style: initial;
              margin-block: .5em;

              li+li {
                margin-block-start: .25em;
              }
            }

            code {
              font-size: 14px;
              line-height: 1.5;
              font-family: Google Sans Mono,monospace;
              color: var(--assistant-content-highlight-color);
              background-color: var(--assistant-content-highlight-background-color);
              border-radius: 6px;
              padding: 1px 6px;
            }

            pre:has(code) {
              max-inline-size: 100%;

              word-break: break-word;
              hyphens: auto;
              text-wrap: pretty;
              white-space: pre-wrap;

              background-color: var(--assistant-content-pre-background-color);
              border-radius: .75em;
              box-sizing: border-box;
              padding: 1em;

              code {
                background-color: transparent;
                border-radius: unset;
                padding: unset;
              }
            }
          }
        }
      }
    }
  }
}

@keyframes rolling-sparkle {
  0% { rotate: 0deg; }
  to { rotate: 360deg; }
}
</style>

<div class="main" ontouchstart="" tabindex="0">
  <div id="ai-assistant" class="ai-assistant" popover="manual">
    <div class="ai-assistant__head">
      <p class="ai-assistant__head__p">${defaults.l10n.subject}</p>
      <button
        type="button"
        class="ai-assistant__head__close"
        data-action="close"
        popovertarget="ai-assistant"
        popovertargetaction="hide"
      >
        cancel
      </button>
    </div>

    <div class="ai-assistant__body">
      <div class="ai-assistant__body_autoscroll">
        <div class="ai-assistant__body_autoscroll__results"></div>
      </div>

      <form class="ai-assistant__body__form">
        <textarea class="ai-assistant__body__form__textarea" name="prompts" placeholder="${defaults.l10n.placeholder}"></textarea>
        <button
          type="submit"
          class="ai-assistant__body__form__submit"
        >
          submit
        </button>
      </form>
    </div>
  </div>
</div>
`;

const templateResultUnit = document.createElement('template');
templateResultUnit.innerHTML = `
<div class="result-unit">
  <p class="result-unit__ask pretty-paragraph">{{ask}}</p>
  <div class="result-unit__reply">
    <div class="result-unit__reply__p pretty-paragraph"></div>
  </div>
</div>
`;

// Houdini Props and Vals, https://web.dev/at-property/
if (CSS?.registerProperty) {
  try {
    CSS.registerProperty({
      name: '--msc-ai-assistant-line-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(199 205 210)'
    });

    CSS.registerProperty({
      name: '--msc-ai-assistant-close-icon-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(95 99 104)'
    });

    CSS.registerProperty({
      name: '--msc-ai-assistant-close-hover-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(245 248 250)'
    });

    CSS.registerProperty({
      name: '--msc-ai-assistant-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255)'
    });

    CSS.registerProperty({
      name: '--msc-ai-assistant-head-text-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(35 42 49)'
    });

    CSS.registerProperty({
      name: '--msc-ai-assistant-content-text-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(35 42 49)'
    });

    CSS.registerProperty({
      name: '--msc-ai-assistant-content-highlight-text-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(68 71 70)'
    });

    CSS.registerProperty({
      name: '--msc-ai-assistant-content-highlight-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(233 238 246)'
    });

    CSS.registerProperty({
      name: '--msc-ai-assistant-content-group-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(241 244 248)'
    });

    CSS.registerProperty({
      name: '--msc-ai-assistant-input-text-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(31 31 31)'
    });

    CSS.registerProperty({
      name: '--msc-ai-assistant-input-placeholder-text-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(95 99 103)'
    });

    CSS.registerProperty({
      name: '--msc-ai-assistant-form-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(240 244 248)'
    });

    CSS.registerProperty({
      name: '--msc-ai-assistant-form-focus-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(233 238 246)'
    });

    CSS.registerProperty({
      name: '--msc-ai-assistant-submit-icon-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(68 71 70)'
    });

    CSS.registerProperty({
      name: '--msc-ai-assistant-submit-hover-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(0 0 0/.07)'
    });
  } catch(err) {
    console.warn(`msc-ai-assistant: ${err.message}`);
  }
}

let available = 'no';
/*
if (window.ai?.[NS]) {
  const {
    available: A,
    defaultTemperature,
    defaultTopK
  } = await window.ai[NS].capabilities();

  available = A;
  defaults.config = {
    systemPrompt: '',
    temperature: defaultTemperature,
    topK: defaultTopK
  };
}
*/

const templateProgressSet = `
<style>
#built-in-ai-loading-progress {
  --size: 50px;

  inset-inline-start: calc(100dvi - var(--size) - 8px);
  inset-block-start: calc(100dvb - var(--size) - 8px);

  inline-size: var(--size);
  aspect-ratio: 1/1;
  border-radius: var(--size);
  background-color: rgba(0 0 0/.8);

  padding: 5px;
  box-sizing: border-box;

  &::after {
    position: absolute;
    inset-inline-start: 50%;
    inset-block-start: 50%;
    content: 'AI';
    color: rgba(255 255 255);
    font-size: 16px;
    transform: translate(-50%, -50%);
  }

  msc-circle-progress {
    --msc-circle-progress-font-size: 0px;
    --msc-circle-progress-font-color: rgba(255 255 255);
    --msc-circle-progress-color: rgba(84 129 236);
  }

  &:popover-open {
    opacity: 1;
    scale: 1;
  }

  opacity: 0;
  scale: .001;

  transition-property: opacity,scale,display;
  transition-duration: 250ms;
  transition-behavior: allow-discrete;

  @starting-style {
    &:popover-open {
      opacity: 0;
      scale: .001;
    }
  }
}
</style>
<div id="built-in-ai-loading-progress" popover>
  <msc-circle-progress size="5" value="0" max="100" round></msc-circle-progress>
</div>
`;

if (window.ai?.[NS]) {
  const updateConfig = async() => {
    const {
      available: A,
      defaultTemperature,
      defaultTopK
    } = await window.ai[NS].capabilities();

    available = A;
    defaults.config = {
      systemPrompt: '',
      temperature: defaultTemperature,
      topK: defaultTopK
    };
  };

  const { available: A } = await window.ai[NS].capabilities();

  if (A === 'after-download') {
    // setup download progress
    document.body.insertAdjacentHTML('beforeend', templateProgressSet);
    const popover = document.querySelector('#built-in-ai-loading-progress');
    const progress = document.querySelector('#built-in-ai-loading-progress msc-circle-progress');

    popover.showPopover();
    requestAnimationFrame(() => progress.refresh());

    await window.ai[NS].create({
      monitor(m) {
        m.addEventListener('downloadprogress',
          async (e) => {
            const { loaded, total } = e;
            const value = Math.floor((loaded / total) * 100);

            progress.value = value;

            // complete loading
            if (loaded >= total) {
              popover.hidePopover();
              await updateConfig();
            }
          }
        );
      }
    });
  } else {
    await updateConfig();
  }
}

export class MscAiAssistant extends HTMLElement {
  #data;
  #nodes;
  #config;

  constructor(config) {
    super();

    // template
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // data
    this.#data = {
      controller: '',
      session: '',
      sessionController: '',
      histories: [],
      currentHistoryIndex: 0,
      inputed: false
    };

    // nodes
    this.#nodes = {
      styleSheet: this.shadowRoot.querySelector('style'),
      assistant: this.shadowRoot.querySelector('.ai-assistant'),
      assistantBody: this.shadowRoot.querySelector('.ai-assistant__body'),
      title: this.shadowRoot.querySelector('.ai-assistant__head__p'),
      results: this.shadowRoot.querySelector('.ai-assistant__body_autoscroll__results'),
      form: this.shadowRoot.querySelector('.ai-assistant__body__form'),
      btnSubmit: this.shadowRoot.querySelector('.ai-assistant__body__form__submit'),
      textarea: this.shadowRoot.querySelector('.ai-assistant__body__form__textarea'),
      autoscroll: this.shadowRoot.querySelector('.ai-assistant__body_autoscroll')
    };

    // config
    this.#config = {
      ...defaults,
      ...config // new MscAiAssistant(config)
    };

    // evts
    this._onSubmit = this._onSubmit.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onInput = this._onInput.bind(this);
  }

  async connectedCallback() {
    const { config, error } = await _wcl.getWCConfig(this);
    const { textarea, form } = this.#nodes;

    if (error) {
      console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${error}`);
      this.remove();
      return;
    } else {
      this.#config = {
        ...this.#config,
        ...config
      };
    }

    // feature detect
    if (available === 'no') {
      return;
    }

    // upgradeProperty
    Object.keys(defaults).forEach((key) => this.#upgradeProperty(key));

    // evts
    this.#data.controller = new AbortController();
    const signal = this.#data.controller.signal;
    form.addEventListener('submit', this._onSubmit, { signal });
    textarea.addEventListener('input', this._onInput, { signal });

    // apply 「shift」+ 「Enter」for line break. (desktop only)
    const mql = window.matchMedia('(hover: hover)');
    if (mql.matches) {
      textarea.addEventListener('keydown', this._onKeydown, { signal, capture: true });
    }
  }

  disconnectedCallback() {
    this.#nodes.assistant.togglePopover(false);

    if (this.#data.controller?.abort) {
      this.#data.controller.abort();
    }

    if (this.#data.sessionController?.abort) {
      this.#data.sessionController.abort();
    }

    if (this.#data.session?.destroy) {
      this.#data.session.destroy();
    }
  }

  #format(attrName, oldValue, newValue) {
    const hasValue = newValue !== null;

    if (!hasValue) {
      if (booleanAttrs.includes(attrName)) {
        this.#config[attrName] = false;
      } else {
        this.#config[attrName] = defaults[attrName];
      }
    } else {
      switch (attrName) {
        case 'l10n':
        case 'config': {
          let values;

          try {
            values = JSON.parse(newValue);
          } catch(err) {
            console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
            values = { ...defaults[attrName] };
          }

          if (attrName === 'l10n') {
            values = { ...defaults.l10n, ...values };
          }

          this.#config[attrName] = values;
          break;
        }

        case 'pip':
          this.#config[attrName] = true;
          break;
      }
    }
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (!MscAiAssistant.observedAttributes.includes(attrName)) {
      return;
    }

    this.#format(attrName, oldValue, newValue);

    switch (attrName) {
      case 'config': {
        this.#nodes.results.replaceChildren();
        break;
      }

      case 'l10n': {
        const { subject, placeholder } = this.l10n;
        const { title, textarea } = this.#nodes;

        title.textContent = subject;
        textarea.placeholder = placeholder;
        break;
      }
    }
  }

  static get observedAttributes() {
    return Object.keys(defaults); // MscAiAssistant.observedAttributes
  }

  static get supportedEvents() {
    return Object.keys(custumEvents).map(
      (key) => {
        return custumEvents[key];
      }
    );
  }

  #upgradeProperty(prop) {
    let value;

    if (MscAiAssistant.observedAttributes.includes(prop)) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        value = this[prop];
        delete this[prop];
      } else {
        if (booleanAttrs.includes(prop)) {
          value = (this.hasAttribute(prop) || this.#config[prop]) ? true : false;
        } else if (objectAttrs.includes(prop)) {
          value = this.hasAttribute(prop) ? this.getAttribute(prop) : JSON.stringify(this.#config[prop]);
        } else {
          value = this.hasAttribute(prop) ? this.getAttribute(prop) : this.#config[prop];
        }
      }

      this[prop] = value;
    }
  }

  set config(value) {
    if (value) {
      const newValue = {
        ...defaults.config,
        ...this.config,
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      };
      this.setAttribute('config', JSON.stringify(newValue));
    } else {
      this.removeAttribute('config');
    }
  }

  get config() {
    return this.#config.config;
  }

  set l10n(value) {
    if (value) {
      const newValue = {
        ...defaults.l10n,
        ...this.l10n,
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      };
      this.setAttribute('l10n', JSON.stringify(newValue));
    } else {
      this.removeAttribute('l10n');
    }
  }

  get l10n() {
    return this.#config.l10n;
  }

  set pip(value) {
    this.toggleAttribute('pip', Boolean(value));
  }

  get pip() {
    return this.#config.pip;
  }

  get available() {
    return available;
  }

  set title(value) {
    if (value) {
      this.setAttribute('title', value);
    } else {
      this.removeAttribute('title');
    }
  }

  get title() {
    return this.#config.title;
  }

  #fireEvent(evtName, detail) {
    this.dispatchEvent(new CustomEvent(evtName,
      {
        bubbles: true,
        composed: true,
        ...(detail && { detail })
      }
    ));
  }

  async #getSession() {
    // abort
    if (this.#data.sessionController?.abort) {
      this.#data.sessionController.abort();
    }

    if (this.#data.session?.destroy) {
      this.#data.session.destroy();
    }

    this.#data.sessionController = new AbortController();
    this.#data.session = await window.ai[NS].create(this.config);

    return this.#data.session;
  }

  _onInput() {
    const { textarea } = this.#nodes;

    this.#data.inputed = !!textarea.value.length;
  }

  _onKeydown(evt) {
    const { key, shiftKey } = evt;
    const { btnSubmit, textarea } = this.#nodes;

    switch (key) {
      case 'Enter': {
        if (!shiftKey) {
          evt.preventDefault();
          btnSubmit.click();
        }
        break;
      }

      case 'ArrowUp':
      case 'ArrowDown': {
        if (this.#data.inputed) {
          return;
        }

        evt.preventDefault();

        const { histories, currentHistoryIndex } = this.#data;
        const count = histories.length;
        const index = (currentHistoryIndex + (key === 'ArrowUp' ? -1 : 1) + count) % count;
        
        this.#data.currentHistoryIndex = index;
        textarea.value = histories[index];
        textarea.selectionEnd = histories[index].length;
        break;
      }
    }
  }

  async _onSubmit(evt) {
    const { form, results, textarea, autoscroll } = this.#nodes;
    const prompts = textarea.value.trim();

    evt.preventDefault();

    if (!prompts) {
      return;
    }

    autoscroll.scrollTop = autoscroll.scrollHeight + 1000;

    const session = await this.#getSession();
    const signal = this.#data.sessionController.signal;

    const resultUnitString = Mustache.render(templateResultUnit.innerHTML, { ask: prompts });
    results.insertAdjacentHTML('beforeend', resultUnitString);

    const resultUnit = results.querySelector(':nth-last-child(1 of .result-unit)');
    const reply = resultUnit.querySelector('.result-unit__reply__p');
    
    textarea.value = '';
    form.inert = true;

    try {
      const stream = session.promptStreaming(prompts, { signal });
      let result = '';
      let previousChunk = '';

      for await (const chunk of stream) {
        const newChunk = chunk.startsWith(previousChunk)
          ? chunk.slice(previousChunk.length) : chunk;

        result += newChunk;
        previousChunk = chunk;

        reply.textContent = result;
      }

      // convert markdown to html
      reply.innerHTML = window.DOMPurify.sanitize(marked.parse(result));
    } catch(err) {
      const { message } = err;

      reply.textContent = this.l10n.error;

      console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${message}`);
      this.#fireEvent(custumEvents.error, { message });
    }


    // update histories
    const index = this.#data.histories.findIndex((value) => value === prompts);
    if (index !== -1) {
      this.#data.histories.splice(index, 1);
    }
    this.#data.histories.push(prompts);
    this.#data.currentHistoryIndex = this.#data.histories.length;
    this.#data.inputed = false;

    form.inert = false;
    textarea.focus();
  }

  async show() {
    if (available === 'no') {
      return;
    }

    // show in pip
    if (this.pip && window?.documentPictureInPicture) {
      const parent = this.parentElement;
      const nextSibling = this.nextElementSibling;

      const pipWindow = await window?.documentPictureInPicture.requestWindow({
        width: 400,
        height: 600
      });
      _wcl.cloneStyleSheetsToDocument(pipWindow.document);

      pipWindow.document.body.append(this);
      pipWindow.addEventListener('pagehide',
        () => {
          if (this.#nodes.nextSibling) {
            parent.insertBefore(this, nextSibling);
          } else {
            parent.appendChild(this);
          }

          this.hide();
        },
        { once:true }
      );
    }

    this.#nodes.assistant.togglePopover(true);
  }

  hide() {
    if (available === 'no') {
      return;
    }

    this.#nodes.assistant.togglePopover(false);
  }

  toggle(force) {
    if (available === 'no') {
      return;
    }

    if (typeof force !== 'undefined') {
      this.#nodes.assistant.togglePopover(Boolean(force));
    } else {
      this.#nodes.assistant.togglePopover();
    }
  }
}

// define web component
const S = _wcl.supports();
const T = _wcl.classToTagName('MscAiAssistant');
if (S.customElements && S.shadowDOM && S.template && !window.customElements.get(T)) {
  window.customElements.define(_wcl.classToTagName('MscAiAssistant'), MscAiAssistant);
}