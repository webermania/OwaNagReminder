// page_hook.js
console.log("[NaggyOutlook] page_hook.js loaded – patching fetch");

(function () {
  const origFetch = window.fetch;
  if (!origFetch) {
    console.warn("[NaggyOutlook] window.fetch not found");
    return;
  }

  window.fetch = async function (...args) {
    const [input] = args;
    const url = typeof input === "string" ? input : input.url;

    const isGetReminders =
      typeof url === "string" &&
      url.includes("/owa/service.svc") &&
      url.includes("action=GetReminders");

    if (isGetReminders) {
      console.log("[NaggyOutlook] fetch called for GetReminders:", url);
    }

    const res = await origFetch.apply(this, args);

    if (isGetReminders) {
      try {
        const clone = res.clone();
        clone
          .json()
          .then((data) => {
            console.log(
              "[NaggyOutlook] parsed GetReminders response, posting message",
              data
            );
            window.postMessage(
              { type: "OUTLOOK_GET_REMINDERS", data },
              "*"
            );
          })
          .catch((err) => {
            console.error(
              "[NaggyOutlook] error parsing GetReminders JSON:",
              err
            );
          });
      } catch (e) {
        console.error(
          "[NaggyOutlook] error cloning GetReminders response:",
          e
        );
      }
    }

    return res;
  };
})();
