"use strict";

async function openInTab(url) {
    await browser.tabs.create({ url })
}

async function openInWindow(url, {incognito = true} = {}) {
    if (url.startsWith("about:") || url.startsWith("chrome:")) {
        return false
    }

    await browser.windows.create({ url, incognito })
    return true
}

async function moveTabToOtherContext(tab) {
    let opened = false
    try {
        opened = await openInWindow(tab.url, {incognito: !tab.incognito})
    } catch (err) {
        console.error("failed to open window", err)
        openInTab("Run_in_Private_Windows.html")
    }
    if (opened) {
        await browser.tabs.remove(tab.id)
    }
}

//
// Add toolbar button handler.
//
browser.action.onClicked.addListener(async (tab) => {
    await moveTabToOtherContext(tab)
})

//
// Add context menu item handler.
//
const actionTitle = browser.i18n.getMessage("actionTitle")
browser.contextMenus.create({title: actionTitle, id: 'escalate-private-tab'}, () => {
    const err = browser.runtime.lastError
    if (err) {
        console.error(err)
    }
})

browser.contextMenus.onClicked.addListener(async (info, tab) => {
    await moveTabToOtherContext(tab)
})

//
// Tell users the extension needs the "Run in Private Windows" permission.
//
browser.runtime.onInstalled.addListener(({ reason, temporary }) => {
    if (reason === "install") {
        openInTab("Run_in_Private_Windows.html")
    }
})
