import { serviceOfferings } from "@/content/site";

export function ServicesContent() {
  return <div className="p-offerings">
    <div className="p-offerings-opening"><div><span className="p-section-label">03 / HOW WE HELP</span><h1 tabIndex={-1}>A little less friction.<br/><em>A lot more possibility.</em></h1></div><p>From your first website to the systems behind your business, we help make the digital side feel simpler.</p></div>
    <div className="p-offerings-list">{serviceOfferings.map((service,index)=><details className="p-offering" key={service.number} open={index===0}>
      <summary><span className="p-offering-number">{service.number}</span><div><h2>{service.name}</h2><p>{service.outcome}</p></div><span className="p-offering-toggle" aria-hidden="true"/></summary>
      <div className="p-offering-body"><div><p className="p-offering-description">{service.description}</p><p className="p-offering-note">{service.note}</p></div><div className="p-offering-scope"><span>WHAT WE CAN CREATE</span><ul>{service.includes.map(item=><li key={item}>{item}</li>)}</ul><a href="#contact">Let’s talk about your project <span>↗</span></a></div></div>
    </details>)}</div>
    <div className="p-offerings-next"><span className="p-section-label">START WITH WHAT’S DIFFICULT.</span><div><h2>You don’t need<br/>all the answers.</h2><p>Tell us what you’re trying to do, what feels complicated, or what keeps taking up your time. We’ll work out a clear scope and a sensible next step together.</p><a href="#contact">Let’s figure it out <span>↗</span></a></div></div>
  </div>;
}
