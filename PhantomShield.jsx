import React from 'react';

// =========================================================================
// OPTION OVERRIDES FOR EASY CUSTOMIZATION
// =========================================================================
const CONFIG = {
  shadowDOM: true,              // Wrap content in a closed Shadow DOM
  interactive: true,            // Enable click-to-copy or mailto action
  interactiveType: 'copy',      // 'copy' (to clipboard) or 'mailto' (link)
  interactiveLabel: 'Copy',     // Visual label for the interactive action (DO NOT USE SECURE TEXT IN LABEL, IT WILL BE VISIBLE IN THE DOM)
};
// =========================================================================

export default function PhantomShield({
  children,
  shadowDOM = CONFIG.shadowDOM,
  interactive = CONFIG.interactive,
  interactiveType = CONFIG.interactiveType,
  interactiveLabel = CONFIG.interactiveLabel,
  className = '',
  style = {},
}) {
  // Fail fast in development, render nothing in production if no content is provided
  if (!children) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'PhantomShield Warning: No text content provided. Please pass a string inside the component tags.'
      );
    }
    return null;
  }

  // Use React.useId for stable server/client IDs. Fallback to random string if not supported.
  const uniqueId = React.useId ? React.useId() : `phantom-${Math.random().toString(36).substring(2, 9)}`;

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
      if (Math.random() < 0.3) {
        items.push({
          id: `zw-${lineIdx}-${index}-${Math.random()}`,
          type: 'zero-width',
          char: '\u200B',
          order: index,
        });
      }

      // 2. DOM Polymorphism: randomly assign character representation
      const rand = Math.random();
      if (rand < 0.35) {
        // Method A: Phantom Atom (CSS Variable content via ::after)
        items.push({
          id: `p-${lineIdx}-${index}-${Math.random()}`,
          type: 'phantom',
          char: char,
          order: index,
        });
      } else if (rand < 0.70) {
        // Method B: CSS Grid column scrambling item
        items.push({
          id: `g-${lineIdx}-${index}-${Math.random()}`,
          type: 'grid-atom',
          char: char,
          order: index,
        });
      } else {
        // Method C: Standard node
        items.push({
          id: `s-${lineIdx}-${index}-${Math.random()}`,
          type: 'standard',
          char: char,
          order: index,
        });
      }

      // 3. Well Poisoning: Decoy elements
      if (Math.random() < 0.25) {
        const decoyChar = String.fromCharCode(33 + Math.floor(Math.random() * 93)); // Random printable ASCII character
        items.push({
          id: `d-${lineIdx}-${index}-${Math.random()}`,
          type: 'decoy',
          char: decoyChar,
          order: index,
        });
      }
    });

    const shuffledItems = [...items].sort(() => Math.random() - 0.5);

    return (
      <div key={lineIdx} className="phantom-line">
        {shuffledItems.map((item) => {
          if (item.type === 'phantom') {
            return (
              <span
                key={item.id}
                className="phantom-atom"
                {...{ style: { order: item.order, '--p': `"${item.char.replace(/"/g, '\\"')}"` } }}
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
    xorKey = Math.floor(Math.random() * 254) + 1;
    // Edge-friendly, standard base64 encoding (replaces Node Buffer to work globally in edge workers)
    const rawPayload = encodeURIComponent(children);
    const xorStr = rawPayload
      .split('')
      .map((c) => String.fromCharCode(c.charCodeAt(0) ^ xorKey))
      .join('');
    encryptedPayload = btoa(unescape(encodeURIComponent(xorStr)));
  }

  // Interactive inline script (Executed fully client-side inside the component, preserving RSC properties)
  const interactionScript = interactive ? `
    (function() {
      // Escape HTML-safe selector query for IDs containing special chars (like :useId:)
      const el = document.getElementById("${uniqueId}") || document.querySelector('[id*="${uniqueId.replace(/:/g, "\\\\:")}"]');
      if (!el) return;
      el.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
          const raw = atob("${encryptedPayload}");
          const clean = decodeURIComponent(
            raw.split("").map(c => String.fromCharCode(c.charCodeAt(0) ^ ${xorKey})).join("")
          );
          if ("${interactiveType}" === "mailto") {
            window.location.href = "mailto:" + clean;
          } else {
            navigator.clipboard.writeText(clean).then(() => {
              const original = el.getAttribute("data-label") || "${interactiveLabel}";
              el.textContent = "Copied!";
              setTimeout(() => { el.textContent = original; }, 1500);
            });
          }
        } catch(err) {
          console.error("Decryption failed", err);
        }
      });
    })();
  ` : '';

  if (shadowDOM) {
    return (
      <span 
        id={uniqueId}
        className={className} 
        style={{ display: 'inline-block', cursor: interactive ? 'pointer' : 'default', ...style }}
        data-label={interactiveLabel}
        data-nosnippet
        suppressHydrationWarning
      >
        {/* Declarative Shadow DOM */}
        {React.createElement('template', {
          shadowrootmode: 'closed',
        }, [
          <style key="styles">{shadowStyles}</style>,
          <span key="wrapper" style={{ display: 'inline-block', width: '100%' }}>
            {lines.map((line, idx) => renderLine(line, idx))}
          </span>
        ])}
        {/* Interactive label or fallback */}
        {interactive ? interactiveLabel : null}
        {/* Zero-JS client execution injection */}
        {interactive && (
          <script 
            dangerouslySetInnerHTML={{ __html: interactionScript }}
          />
        )}
      </span>
    );
  }

  return (
    <span 
      id={uniqueId}
      className={className} 
      style={{ display: 'inline-block', cursor: interactive ? 'pointer' : 'default', ...style }}
      data-label={interactiveLabel}
      data-nosnippet
      suppressHydrationWarning
    >
      <style>{shadowStyles}</style>
      <span style={{ display: 'inline-block', width: '100%' }}>
        {lines.map((line, idx) => renderLine(line, idx))}
      </span>
      {interactive ? <span style={{ marginLeft: '6px', fontSize: '0.85em', textDecoration: 'underline' }}>({interactiveLabel})</span> : null}
      {interactive && (
        <script 
          dangerouslySetInnerHTML={{ __html: interactionScript }}
        />
      )}
    </span>
  );
}
