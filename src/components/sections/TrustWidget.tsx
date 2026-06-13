import { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function TrustWidget() {
  const [settings, setSettings] = useState<{
    showTrustWidget?: boolean;
    trustWidgetCode?: string;
  }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'company-legal'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSettings({
          showTrustWidget: data.showTrustWidget,
          trustWidgetCode: data.trustWidgetCode,
        });
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!settings.showTrustWidget || !settings.trustWidgetCode) {
      return;
    }

    if (containerRef.current) {
      // Clear previous content
      containerRef.current.innerHTML = '';

      // Parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = settings.trustWidgetCode;

      // Extract nodes, run scripts
      const nodes = Array.from(tempDiv.childNodes);
      const scripts: HTMLScriptElement[] = [];

      nodes.forEach((node) => {
        if (node.nodeName.toLowerCase() === 'script') {
          const scriptNode = node as HTMLScriptElement;
          const newScript = document.createElement('script');

          // Copy attrs
          Array.from(scriptNode.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });

          newScript.innerHTML = scriptNode.innerHTML;
          scripts.push(newScript);
        } else {
          containerRef.current?.appendChild(node.cloneNode(true));
        }
      });

      // Execute scripts in order
      scripts.forEach((script) => {
        containerRef.current?.appendChild(script);
      });
    }
  }, [settings.showTrustWidget, settings.trustWidgetCode]);

  if (!settings.showTrustWidget || !settings.trustWidgetCode) {
    return null;
  }

  return (
    <section 
      id="trust-widget" 
      className="py-12 bg-transparent relative z-20 flex justify-center items-center w-full max-w-7xl mx-auto px-6 overflow-hidden md:py-16"
    >
      <div 
        ref={containerRef}
        className="w-full flex justify-center items-center text-center select-none"
      />
    </section>
  );
}
