# 📣 Outlook Naggy Reminders (Chrome/Edge Extension)

A Chrome/Edge (Chromium) extension that **hooks Outlook Web’s internal `GetReminders` API** and provides **extra, highly noticeable meeting reminders**.

This extension creates **additional reminders** at:

* **2 minutes before meeting start**
* **15 seconds before meeting start**

Both reminders use:

* **Persistent popup windows**
  → They **bring a window to focus** when the reminder triggers
  → They pop up **even if Outlook is not focused**, minimized, or in another workspace

You can later add more reminders (+30s after start, repeating nags, sound, etc.).

## 📦 Installation

1. **Clone or Download** this repository.
2. Open Chrome/Edge and go to `chrome://extensions`.
3. Enable **Developer Mode** (top right toggle).
4. Click **Load Unpacked**.
5. Select the folder containing this repository (`OwaNagReminder`).
6. **Refresh your Outlook Web tab** to activate the hook.

---

# 🚀 Features

### ✔ Fully automatic reminders

No need to re-enter events manually.
The extension hooks into Outlook Web’s own async calls.

### ✔ No configuration or login required

Just install and refresh your Outlook tab. It works automatically without any setup or extra authentication.

### ✔ Uses Outlook’s *internal* API: `/owa/service.svc?action=GetReminders`

This is how OWA itself retrieves the list of reminders.

### ✔ Works even when Outlook is not focused

Because notifications are from the browser, not from the Outlook tab.

### ✔ Respects changes

If an event is:

* moved
* deleted
* reminder changed
  …your alarms update accordingly.

### ✔ MV3-compliant

Uses a **service worker**, **alarms**, and **windows**.

### ✔ 100% local

No servers, no external API keys, no Graph API permissions, no token storage.

---

# 🛠 How it Works

### 1. `page_hook.js` runs inside Outlook’s JavaScript world

We inject it as an external script (allowed by Outlook CSP):

* It monkey-patches `window.fetch`
* Whenever Outlook calls `GetReminders`, we:

  * detect it
  * clone & parse the JSON
  * forward the reminder list to the extension via `postMessage`

### 2. `content.js` bridges page → extension

It listens for:

```js
window.postMessage({ type: "OUTLOOK_GET_REMINDERS", data })
```

And forwards it to the background service worker via:

```js
chrome.runtime.sendMessage(...)
```

### 3. `background.js` (service worker)

Maintains a small “snapshot”:

```json
{
  "events": {
    "<uid>": { "subject": "...", "start": "..." }
  }
}
```

On every update:

* Detects **new**, **changed**, and **removed** meetings.
* Schedules alarms using:

  * `chrome.alarms.create(name, { when: timestamp })`
* When an alarm fires:

  * Creates a **popup window** (`reminder.html`) that forces focus.

---

# 📚 File Overview

```
extension-root/
│
├─ manifest.json              # MV3 manifest
├─ background.js              # service worker (alarms + popup window management)
├─ content.js                 # injects hook + forwards messages
├─ page_hook.js               # patches fetch() inside Outlook Web
├─ popup_list.html            # default popup (event list)
├─ popup_list.js              # logic for default popup
├─ reminder.html              # the actual reminder popup window
├─ reminder.js                # logic for reminder popup
├─ icon128.png                # notification icon
└─ README.md
```

# 📄 License

Apache-2.0 License. Free to use and modify.

# 🔒 Privacy

This extension is **100% local**. It does not send any data to external servers. It only communicates between the Outlook tab and your browser's local storage to manage alarms.
