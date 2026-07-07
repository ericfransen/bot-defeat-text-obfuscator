import React from 'react';

function createPRNG(seedString) {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  let seed = Math.abs(hash) || 1;
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}


// =========================================================================
// OPTION OVERRIDES FOR EASY CUSTOMIZATION
// =========================================================================
const CONFIG = {
  shadowDOM: false,                                     // Set to false by default for broad React client compatibility
  interactive: true,                                    // Enable click-to-copy or mailto action
  interactiveType: 'copy',                              // 'copy' (to clipboard), 'tel' (phone call), or 'mailto' (email client)
  iconOnly: false,                                      // If true, hide scrambled text entirely & only render interactive icon
};
// =========================================================================

export default function PhantomShield({
  children,
  shadowDOM = CONFIG.shadowDOM,
  interactive = CONFIG.interactive,
  interactiveType = CONFIG.interactiveType,
  iconOnly = CONFIG.iconOnly,
  className = '',
  style = {},
  ...props
}) {
  // Fail fast in development, render nothing in production if no content is provided
  if (!children) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.warn(
        'PhantomShield Warning: No text content provided. Please pass a string inside the component tags.'
      );
    }
    return null;
  }

  const prng = createPRNG(children || '');

  // Use React.useId for stable server/client IDs. Fallback to random string if not supported.
  const uniqueId = React.useId ? React.useId() : `phantom-${prng().toString(36).substring(2, 9)}`;
  const safeId = uniqueId.replace(/[^a-zA-Z0-9-]/g, '');

  // Setup styles for shadow root or container
  const shadowStyles = `
    .phantom-line {
      display: flex;
      flex-wrap: nowrap;
      align-items: baseline;
      position: relative;
      user-select: none;
      -webkit-user-select: none;
    }
    .phantom-atom::after {
      content: var(--p);
      white-space: pre;
    }
    .phantom-decoy {
      display: none !important;
      position: absolute !important;
      opacity: 0 !important;
      font-size: 0 !important;
      width: 0 !important;
      height: 0 !important;
      pointer-events: none !important;
    }
    .phantom-text {
      white-space: pre;
      display: inline;
    }
  `;

  // Split lines to preserve layout
  const lines = children.split('\n');

  // Render a single line's content
  const renderLine = (line, lineIdx) => {
    if (line === '') {
      return <div key={lineIdx} style={{ minHeight: '1.2em' }}><br /></div>;
    }

    const characters = line.split('');
    const items = [];

    characters.forEach((char, index) => {
      // 1. Zero-width character insertion
      if (prng() < 0.3) {
        items.push({
          id: `zw-${lineIdx}-${index}-${prng()}`,
          type: 'zero-width',
          char: '\u200B',
          order: index,
        });
      }

      // 2. DOM Polymorphism: randomly assign character representation
      const rand = prng();
      if (rand < 0.35) {
        // Method A: Phantom Atom (CSS Variable content via ::after)
        items.push({
          id: `p-${lineIdx}-${index}-${prng()}`,
          type: 'phantom',
          char: char,
          order: index,
        });
      } else if (rand < 0.70) {
        // Method B: CSS Grid column scrambling item
        items.push({
          id: `g-${lineIdx}-${index}-${prng()}`,
          type: 'grid-atom',
          char: char,
          order: index,
        });
      } else {
        // Method C: Standard node
        items.push({
          id: `s-${lineIdx}-${index}-${prng()}`,
          type: 'standard',
          char: char,
          order: index,
        });
      }

      // 3. Well Poisoning: Decoy elements
      if (prng() < 0.25) {
        const decoyChar = String.fromCharCode(33 + Math.floor(prng() * 93)); // Random printable ASCII character
        items.push({
          id: `d-${lineIdx}-${index}-${prng()}`,
          type: 'decoy',
          char: decoyChar,
          order: index,
        });
      }
    });

    const shuffledItems = [...items].sort(() => prng() - 0.5);

    return (
      <div key={lineIdx} className="phantom-line">
        {shuffledItems.map((item) => {
          if (item.type === 'phantom') {
            return (
              <span
                key={item.id}
                className="phantom-atom"
                style={{ order: item.order, '--p': `"${item.char.replace(/"/g, '\\"')}"` }}
              />
            );
          } else if (item.type === 'grid-atom') {
            return (
              <span
                key={item.id}
                className="phantom-text"
                style={{ order: item.order }}
              >
                {item.char}
              </span>
            );
          } else if (item.type === 'standard') {
            return (
              <span key={item.id} className="phantom-text" style={{ order: item.order }}>
                {item.char}
              </span>
            );
          } else if (item.type === 'decoy') {
            return (
              <span key={item.id} className="phantom-decoy">
                {item.char}
              </span>
            );
          } else if (item.type === 'zero-width') {
            return (
              <span key={item.id} className="phantom-text" style={{ order: item.order }}>
                {item.char}
              </span>
            );
          }
          return null;
        })}
      </div>
    );
  };

  // XOR Server Encryption for Interactive actions
  let encryptedPayload = '';
  let xorKey = 0;
  if (interactive) {
    xorKey = Math.floor(prng() * 254) + 1;
    // Edge-friendly, standard base64 encoding (replaces Node Buffer to work globally in edge workers)
    const rawPayload = encodeURIComponent(children);
    const xorStr = rawPayload
      .split('')
      .map((c) => String.fromCharCode(c.charCodeAt(0) ^ xorKey))
      .join('');
    encryptedPayload = btoa(unescape(encodeURIComponent(xorStr)));
  }

  // SVG Icons
  const iconCopy = `<svg style="width:16px; height:16px; color:#64748b; transition:color 0.2s;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>`;
  const iconMail = `<svg style="width:16px; height:16px; color:#64748b; transition:color 0.2s;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>`;
  const iconTel = `<svg style="width:16px; height:16px; color:#64748b; transition:color 0.2s;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>`;

  let svgIcon = iconCopy;
  if (interactiveType === 'mailto') svgIcon = iconMail;
  if (interactiveType === 'tel') svgIcon = iconTel;

  const interactionStyles = interactive ? `
    .ps-wrap-${safeId} { cursor:pointer; display:inline-flex; align-items:center; gap:0.5rem; position:relative; }
    .ps-wrap-${safeId}:hover svg { color: #60a5fa !important; transform: scale(1.1); }
    .ps-wrap-${safeId} .icon-box { opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center; }
    .ps-wrap-${safeId}:hover .icon-box { opacity:1; }
    .ps-wrap-${safeId} .feedback { 
      position:absolute; top:-35px; left:50%; transform:translateX(-50%); 
      background:#0f172a; color:white; font-family:sans-serif; font-size:11px; font-weight:800; letter-spacing:0.05em;
      padding:6px 16px; border-radius:99px; box-shadow:0 4px 12px rgba(0,0,0,0.4);
      opacity:0; transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1); pointer-events:none; white-space:nowrap; z-index:50;
    }
    .ps-wrap-${safeId} .feedback::after {
      content:''; position:absolute; bottom:-4px; left:50%; margin-left:-4px;
      border-width:4px; border-style:solid; border-color:#0f172a transparent transparent transparent;
    }
  ` : '';

  let interactionLogic = '';
  if (interactive) {
    if (interactiveType === 'mailto') {
      interactionLogic = `window['loca' + 'tion']['hr' + 'ef'] = String.fromCharCode(109,97,105,108,116,111,58) + clean;`;
    } else if (interactiveType === 'tel') {
      interactionLogic = `window['loca' + 'tion']['hr' + 'ef'] = String.fromCharCode(116,101,108,58) + clean;`;
    } else {
      interactionLogic = `
                const showTooltip = () => {
                  const f = el.querySelector('.feedback');
                  if (f) {
                    f.style.opacity = '1';
                    f.style.top = '-45px';
                    setTimeout(() => { f.style.opacity = '0'; f.style.top = '-35px'; }, 1500);
                  }
                };
                if (navigator.clipboard && window.isSecureContext) {
                  navigator.clipboard.writeText(clean).then(showTooltip).catch(() => {});
                } else {
                  const ta = document.createElement('textarea');
                  ta.value = clean;
                  ta.style.position = 'fixed';
                  ta.style.opacity = '0';
                  document.body.appendChild(ta);
                  ta.focus();
                  ta.select();
                  try { document.execCommand('copy'); showTooltip(); } catch(err) {}
                  document.body.removeChild(ta);
                }
      `;
    }
  }

  const iconElements = interactive ? (
    <span dangerouslySetInnerHTML={{
      __html: `
        <span class="icon-box">${svgIcon}</span>
        <span class="feedback">Copied!</span>
        <span 
          style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:40; cursor:pointer;"
          onclick="(function(e, el) {
            e.preventDefault();
            e.stopPropagation();
            try {
              const raw = decodeURIComponent(escape(atob('${encryptedPayload}')));
              const clean = decodeURIComponent(
                raw.split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ (${xorKey + 11} - 11))).join('')
              );
              ${interactionLogic}
            } catch(err) {}
          })(event, this.parentElement)"
        ></span>
      `
    }} />
  ) : null;

  if (shadowDOM) {
    return (
      <span 
        id={uniqueId}
        className={`ps-wrap-${safeId} ${className}`} 
        style={{
          display: interactive ? 'inline-flex' : 'inline-block',
          alignItems: interactive ? 'center' : undefined,
          gap: interactive ? '0.5rem' : undefined,
          position: interactive ? 'relative' : undefined,
          cursor: interactive ? 'pointer' : 'default',
          ...style
        }}
        data-nosnippet
        suppressHydrationWarning
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      >
        {React.createElement('template', {
          shadowrootmode: 'closed',
        }, [
          <style key="styles">{shadowStyles}</style>,
          !iconOnly ? (
            <span key="wrapper" style={{ display: 'inline-block' }}>
              {lines.map((line, idx) => renderLine(line, idx))}
            </span>
          ) : null
        ])}
        {interactive && <style>{interactionStyles}</style>}
        {iconElements}
      </span>
    );
  }

  return (
    <span 
      id={uniqueId}
      className={`ps-wrap-${safeId} ${className}`} 
      style={{
        display: interactive ? 'inline-flex' : 'inline-block',
        alignItems: interactive ? 'center' : undefined,
        gap: interactive ? '0.5rem' : undefined,
        position: interactive ? 'relative' : undefined,
        cursor: interactive ? 'pointer' : 'default',
        ...style
      }}
      data-nosnippet
      suppressHydrationWarning
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      <style>{shadowStyles}</style>
      {interactive && <style>{interactionStyles}</style>}
      {!iconOnly && (
        <span style={{ display: 'inline-block' }}>
          {lines.map((line, idx) => renderLine(line, idx))}
        </span>
      )}
      {iconElements}
    </span>
  );
}
