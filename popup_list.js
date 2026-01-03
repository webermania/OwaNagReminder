// popup_list.js

document.addEventListener('DOMContentLoaded', async () => {
    const listEl = document.getElementById('reminders-list');
    const lastUpdatedEl = document.getElementById('last-updated');

    async function render() {
        // 1. Get data from storage
        const stored = await chrome.storage.local.get(["events", "lastUpdated"]);
        const eventsMap = stored.events || {};
        const lastUpdated = stored.lastUpdated;

        // Update "Last sync" text
        if (lastUpdated) {
            const date = new Date(lastUpdated);
            lastUpdatedEl.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            lastUpdatedEl.title = date.toLocaleString(); // Full date on hover
        } else {
            lastUpdatedEl.textContent = "Never";
        }

        // 2. Convert to array and sort
        const now = Date.now();
        const events = Object.values(eventsMap)
            .map(evt => ({
                ...evt,
                startTime: new Date(evt.start).getTime()
            }))
            .filter(evt => evt.startTime > now - 1000 * 60 * 60) // Show events from 1 hour ago onwards
            .sort((a, b) => a.startTime - b.startTime);

        // 3. Render
        if (events.length === 0) {
            listEl.innerHTML = '<div class="empty-state">No upcoming events found.<br>Open Outlook to sync.</div>';
            return;
        }

        listEl.innerHTML = '';

        events.forEach(evt => {
            const li = document.createElement('li');
            li.className = 'reminder-item';

            const dateObj = new Date(evt.startTime);
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

            // Calculate relative time
            const diffMs = evt.startTime - now;
            const diffMins = Math.round(diffMs / 60000);
            let relativeStr = "";

            if (diffMins < 0) {
                relativeStr = `${Math.abs(diffMins)}m ago`;
            } else if (diffMins === 0) {
                relativeStr = "Now";
            } else if (diffMins < 60) {
                relativeStr = `in ${diffMins}m`;
            } else {
                const hours = Math.floor(diffMins / 60);
                const mins = diffMins % 60;
                relativeStr = `in ${hours}h ${mins}m`;
            }

            li.innerHTML = `
          <div class="reminder-subject" title="${evt.subject}">${evt.subject}</div>
          <div class="reminder-time">
            <span class="time-badge">${relativeStr}</span>
            ${timeStr}
          </div>
        `;

            listEl.appendChild(li);
        });
    }

    // Initial render
    await render();

    // Update every 60 seconds to keep relative times fresh
    setInterval(render, 60000);
});
