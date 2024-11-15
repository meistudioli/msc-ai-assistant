# msc-ai-assistant

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/msc-ai-assistant) [![DeepScan grade](https://deepscan.io/api/teams/16372/projects/28306/branches/911426/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=16372&pid=28306&bid=911426)

&lt;msc-ai-assistant /> is a web component based on Chrome Built-in AI Prompt API. Web developers could use &lt;msc-ai-assistant /> to help user consult anything they like to know.

![<msc-ai-assistant />](https://blog.lalacube.com/mei/img/preview/msc-ai-assistant.png)

## Basic Usage

&lt;msc-ai-assistant /> is a web component. All we need to do is put the required script into your HTML document. Then follow &lt;msc-ai-assistant />'s html structure and everything will be all set.

- Required Script

```html
<script
  type="module"
  src="https://unpkg.com/msc-ai-assistant/mjs/wc-msc-ai-assistant.js">        
</script>
```

- Structure

Put &lt;msc-ai-assistant /> into HTML document. It will have different functions and looks with attribute mutation.

```html
<msc-ai-assistant>
  <script type="application/json">
      {
        "config": {
          "systemPrompt": "You are a front-end engineer and very good at CSS, HTML and JavaScript.",
          "temperature": 0.8,
          "topK": 3
        },
        "l10n": {
          "subject": "AI Assistant",
          "placeholder": "Ask Gemini"
        },
        "pip": false
      }
  </script>
</msc-ai-assistant>
```

Otherwise, developers could also choose remoteconfig to fetch config for &lt;msc-ai-assistant />.

```html
<msc-ai-assistant
  remoteconfig="https://your-domain/api-path"
>
  ...
</msc-ai-assistant>
```

## JavaScript Instantiation

&lt;msc-ai-assistant /> could also use JavaScript to create DOM element. Here comes some examples.

```html
<script type="module">
import { MscAiAssistant } from 'https://unpkg.com/msc-ai-assistant/mjs/wc-msc-ai-assistant.js';

// use DOM api
const nodeA = document.createElement('msc-ai-assistant');
document.body.appendChild(nodeA);
nodeA.config = {
  systemPrompt: 'You are a front-end engineer and very good at CSS, HTML and JavaScript.',
  temperature: .8,
  topK: 3
};

// new instance with Class
const nodeB = new MscAiAssistant();
document.body.appendChild(nodeB);
nodeB.config = {
  systemPrompt: 'You are a top sales and very good at product consulting.',
  temperature: .8,
  topK: 3
};

// new instance with Class & default config
const config = {
  config: {
    systemPrompt: 'You are a writer and very good at rewriting article and make them more vivid.',
    temperature: .8,
    topK: 3
  }
};
const nodeC = new MscAiAssistant(config);
document.body.appendChild(nodeC);
</script>
```

## Style Customization

Developers could apply styles to decorate &lt;msc-ai-assistant />'s looking.

```html
<style>
msc-ai-assistant {
  /* main */
  --msc-ai-assistant-inline-size: 400px;
  --msc-ai-assistant-block-size: 600px;
  --msc-ai-assistant-inset-inline-start: 16px;
  --msc-ai-assistant-inset-block-start: 16px;
  --msc-ai-assistant-box-shadow: none;
  --msc-ai-assistant-z-index: 1000;
  --msc-ai-assistant-background-color: rgba(255 255 255);
  --msc-ai-assistant-head-text-color: rgba(35 42 49);
  --msc-ai-assistant-line-color: rgba(199 205 210);
  --msc-ai-assistant-close-icon-color: rgba(95 99 104);
  --msc-ai-assistant-close-hover-background-color: rgba(245 248 250);
  --msc-ai-assistant-content-text-color: rgba(35 42 49);
  --msc-ai-assistant-content-highlight-text-color: rgba(68 71 70);
  --msc-ai-assistant-content-highlight-background-color: rgba(233 238 246);
  --msc-ai-assistant-content-group-background-color: rgba(241 244 248);

  /* form */
  --msc-ai-assistant-input-text-color: rgba(31 31 31);
  --msc-ai-assistant-input-placeholder-text-color: rgba(95 99 103);
  --msc-ai-assistant-form-background-color: rgba(240 244 248);
  --msc-ai-assistant-form-focus-background-color: rgba(233 238 246);
  --msc-ai-assistant-submit-icon-color: rgba(68 71 70);
  --msc-ai-assistant-submit-hover-background-color: rgba(0 0 0/.07);
}
</style>
```

## Attributes

&lt;msc-ai-assistant /> supports some attributes to let it become more convenience & useful.

- **config**

Set [Prompt API](https://docs.google.com/document/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c/edit?tab=t.0) create config.

`systemPrompt`：Set systemPrompt. Default is empty string.\
`temperature`：Set temperature. Default is `0.8`.\
`topK`：Set topK. Default is `3`.

```html
<msc-ai-assistant config='{"systemPrompt":"","temperature":0.8,"topK":3}'>
  ...
</msc-ai-assistant>
```

- **pip**

Turn &lt;msc-ai-assistant /> into picture-in-picture mode or not. It is false by default (not set).

```html
<msc-ai-assistant pip>
  ...
</msc-ai-assistant>
```

- **l10n**

Set localization for title or form information.

`subject`：Set dialog subject.\
`placeholder`：Set placeholder for input field.\
`error`：Set messages when error occured.

```html
<msc-ai-assistant l10n='{"subject":"AI Assistant","placeholder":"Ask Gemini.","error":"Something wrong. Try again please."}'>
  ...
</msc-ai-assistant>
```

## Properties

| Property Name | Type | Description |
| ----------- | ----------- | ----------- |
| config | Object | Getter / Setter Prompt API create config. Developers could set `systemPrompt`、`temperature` and `topK` here. |
| pip | Boolean | Getter / Setter pip. Turn <msc-ai-assistant /> into picture-in-picture mode or not. It is `false` by default. |
| l10n | Object | Getter / Setter localization for title or or form information. Developers could set `subject`、`placeholder` and `error` here. |
| available | String | Getter available. Web developers will get "`no`" if current browser doesn't support Build-in AI. |

## Mathods

| Mathod Signature | Description |
| ----------- | ----------- |
| show() | Display assistant window. (It will open in picture-in-picture window once pip set) |
| hide() | Hide assistant window. |
| toggle(force) | Toggle assistant window display or not. （`force` is optional, developers could set boolean to force display or not） |

## Event
| Event Signature | Description |
| ----------- | ----------- |
| msc-ai-assistant-error | Fired when prompt error occured. Developers could gather `message` information through event.detail. |

## Reference
- [AI on Chrome > Built-in AI](https://developer.chrome.com/docs/ai/built-in)
- [Join the early preview program
](https://docs.google.com/forms/d/e/1FAIpQLSfZXeiwj9KO9jMctffHPym88ln12xNWCrVkMY_u06WfSTulQg/viewform)
- [Built-in AI > Prompt API](https://docs.google.com/document/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c/edit?tab=t.0)
- [&lt;msc-ai-assistant /> demo](https://blog.lalacube.com/mei/webComponent_msc-ai-assistant.html)
- [YouTube tutorial](https://youtu.be/Pn6tm3YSZ1U)
- [WEBCOMPONENTS.ORG](https://www.webcomponents.org/element/msc-ai-assistant)
