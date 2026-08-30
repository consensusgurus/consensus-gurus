'use client';

// THE SHARE POP-UP IS GONE (owner, 2026-08-30).
//
// Every pop-up on the site came off that day except the Trivia Gauntlet nudge,
// this one included. It was not an interstitial — it only opened when somebody
// pressed a Share button — but it was still a modal standing between a player
// and the thing they had just asked for, and the owner's call was that pressing
// Share should simply share.
//
// THIS FILE IS A STUB, NOT A DELETION, AND THAT IS DELIBERATE. Roughly ninety
// components import notifyShareCredit, and all but one of them are already
// written as:
//
//     if (notifyShareCredit(text)) return;      // pop-up took it
//     ... navigator.share / clipboard.writeText // otherwise do it ourselves
//
// So the whole removal is one line: return false, and every Share button on the
// site falls through to its own native-share sheet or clipboard copy, which is
// the behaviour those callers were always written to have. Editing ninety files
// to drop an import would have been ninety chances to break a share handler for
// no gain, and it would have made restoring this a ninety-file job too.
//
// WHAT IS LOST, so nobody rediscovers it as a bug: the pop-up was where a
// registered sharer's REFERRAL CODE was stamped into the link, and where a
// signed-out sharer was invited to make an account. Shared links now carry
// whatever the caller built, unstamped, so referral credit is no longer earned
// through the share buttons. The referral capture itself (lib/referrals.js) and
// the ?ref= links people already have out there are untouched — only this one
// way of MINTING a stamped link is gone. Restore by reinstating the component
// from git history and re-mounting it in app/layout.js.
//
// The default export stays and renders null so an accidental re-mount is inert.

export const SHARE_CREDIT_EVENT = 'sot:share-credit';

// Always false: "I did not handle this share, do it yourself." Kept as a
// function rather than removed so no caller has to change.
export function notifyShareCredit() {
  return false;
}

export default function ShareCreditPop() {
  return null;
}
