import { Component, useEffect, useRef, useState } from 'react';
import { SafetyItem, Material, Access, Sign, Section, SectionSafety, SectionMaterials, SectionFreeText, SectionCleanup, PaperSize, type CleanupItem, SectionMaintenance, MaintenanceItem } from './types';
import { safetyIcon2svg, safetyIcon2name, iconCleanup, ColorClass, iconAllowedMaterial, iconProhibitedMaterial } from './view_common';
import * as QRCode from 'qrcode';
import facebookIcon from '@/assets/facebook_icon.svg';
import { DiscordQR } from './components/DiscordQR';


const PreviewMaterial = ({ material, allowed }: { material: Material, allowed: boolean }) => (
  <div>
    {/* <img className="invert" src={ materialIcon2svg[material.icon] || "" } /> */}
    <img className="invert" src={allowed ? iconAllowedMaterial : iconProhibitedMaterial} />
    <p>{material.label || "Unnamed Material"}</p>
  </div>
)

const PreviewSectionGroup = ({ className, name, children }: { className: string, name: string, children: any }) => (
  <div className={"sign-section " + className}>
    <h2>{name}</h2>
    {children}
  </div>
);

const PreviewSectionMaterials = ({ section, useHorizontalList }: { section: SectionMaterials, useHorizontalList: boolean }) => (
  <PreviewSectionGroup
    className={`sign-materials-${section.allowed ? "allowed" : "prohibited"}`}
    name={section.header()}>
    <div className={(useHorizontalList ? "item-list-horizontal-small " : "item-list ") + (section.materials.length > 1 ? "many" : "")}>
      {section.materials.map((item, i) => <PreviewMaterial key={i} material={item} allowed={section.allowed} />)}
    </div>
  </PreviewSectionGroup>
);

const PreviewSectionFreeText = ({ section }: { section: SectionFreeText }) => {
  return (<PreviewSectionGroup
    className="sign-quickstart"
    name={section.header()}>
    <p>{section.contents}</p>
  </PreviewSectionGroup>);
}

const PreviewSafetyItem = ({ item }: { item: SafetyItem }) => (
  <div>
    <img className="invert" src={safetyIcon2svg[item.icon] || ""} />
    <p>{item.label || safetyIcon2name[item.icon]}</p>
  </div>
)

const PreviewSectionSafety = ({ section }: { section: SectionSafety }) => (
  <PreviewSectionGroup
    className="sign-safety"
    name={section.header()}>
    <div className="item-list">
      {section.icons.map(item => <PreviewSafetyItem item={item} />)}
    </div>
  </PreviewSectionGroup>
);


const PreviewCleanupItem = ({ item }: { item: CleanupItem }) => (
  <div>
    <img className="invert" src={iconCleanup || ""} />
    <p>{item.label || "Untitled task"}</p>
  </div>
)

const PreviewSectionMaintenance = ({ section }: { section: SectionMaintenance }) => (
  <PreviewSectionGroup
    className="sign-maintenance"
    name={section.header()}>
    <div className="item-list-rows">
      {section.rows.map(PreviewMaintenanceItem)}
    </div>
  </PreviewSectionGroup>
);


const PreviewMaintenanceItem = (item: MaintenanceItem) => (
  <div>
    <span className="label">{item.label || "No description"}</span>
    <span className="interval">{item.interval}</span>
    <span className="maintenance-label-space">Last done</span>
  </div>
)

const PreviewSectionCleanup = ({ section }: { section: SectionCleanup }) => (
  <PreviewSectionGroup
    className="sign-cleanup"
    name={section.header()}>
    <div className={"item-list-horizontal-small " + (section.items.length > 1 ? "many" : "")}>
      {section.items.map((item, i) => <PreviewCleanupItem key={i} item={item} />)}
    </div>
  </PreviewSectionGroup>
);


const SignHeader = ({ sign }: { sign: Sign }) => {
  const model = sign.model ? (<span id="machine-model">Model: {sign.model}</span>) : null;

  // Bit of a hack to reduce the image height to match the name height
  const nameRef = useRef<HTMLDivElement>(null);
  const [imageHeight, setImageHeight] = useState(0);

  useEffect(() => {
    if (nameRef.current) {
      setImageHeight(nameRef.current.offsetHeight);
    }
  }, [nameRef]);

  return (
    <div className="sign-header">
      <div className={`sign-section sign-name ${ColorClass(sign)}`} ref={nameRef}>
        <h1 id="machine-name">{sign.name}</h1>
        {model}
      </div>
      {sign.imageUrl ? (
        <img
          src={sign.imageUrl}
          className="sign-header-image"
          style={{height: imageHeight}}
        />
      ) : null}
    </div>
  );
}

const accessMessage: { [id: number]: string } = {};
accessMessage[Access.CourseRequired] = "You must complete a course to use this machine";
accessMessage[Access.UsableByEveryone] = "All members may use this machine";
accessMessage[Access.UsableByEveryoneCareful] = "You may use this machine if you know how to operate it and can do so safely";

class CourseQRCode extends Component<{ sign: Sign }, { qrData: string }> {
  lastQRUrl: string | null = null;

  constructor(props: { sign: Sign }) {
    super(props);
    this.state = { qrData: "" };
    this.componentDidUpdate();
  }

  override componentDidUpdate() {
    const url = this.props.sign.courseURL.trim();

    if (url != this.lastQRUrl) {
      this.lastQRUrl = url;

      if (url == "") {
        this.setState({ qrData: "" });
      } else {
        const opts: QRCode.QRCodeToDataURLOptions = {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          margin: 1,
          color: {
            dark: "#000",
            light: "#FFF"
          }
        }

        QRCode.toDataURL(url, opts).then(data => {
          this.setState({ qrData: data });
        });
      }
    }
  }

  override render() {
    if (this.state.qrData != "") {
      return (
        <div>
          <img src={this.state.qrData} />
          <h3>Online Course</h3>
        </div>
      )
    }
    return null;
  }
}

const SignAccess = ({ sign }: { sign: Sign }) => (
  <PreviewSectionGroup className={ColorClass(sign)} name="Access">
    <div className="sign-access">
      {sign.courseURL != "" ? <CourseQRCode sign={sign} /> : null}
      <span className="sign-access-label">{accessMessage[sign.access]}</span>
    </div>
  </PreviewSectionGroup>
)

const SignOutOfOrder = ({ sign }: { sign: Sign }) => {
  const reason = sign.outOfOrderReason ? (<p>{sign.outOfOrderReason}</p>) : null;
  return (
    <PreviewSectionGroup className={ColorClass(sign)} name="Status">
      <span className="sign-access-label">This machine is out of order</span>
      {reason}
      <p>See Discord for updates</p>
      <div className="sign-outoforder-icons">
        <DiscordQR />
      </div>
    </PreviewSectionGroup>
  );
}

class PreviewSignFooter extends Component<{ id: string | null, sign: Sign }, { qrData: string }> {
  lastQRUrl: string | null = null;

  constructor(props: { id: string | null, sign: Sign }) {
    super(props);
    this.state = { qrData: "" };
    this.componentDidUpdate();
  }

  override componentDidUpdate() {
    const url = this.props.sign?.wikiURL?.trim() || "http://wiki.makerspace.se";

    if (url != this.lastQRUrl) {
      this.lastQRUrl = url;

      const opts: QRCode.QRCodeToDataURLOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        margin: 1,
        color: {
          dark: "#000",
          light: "#FFF"
        }
      }

      QRCode.toDataURL(url, opts).then(data => {
        this.setState({ qrData: data });
      });
    }
  }

  override render() {
    return (
      <>
        <div className="sign-footer">
          <div>
            <img src={this.state.qrData} />
            <div>
              <h3>Wiki</h3>
              <p>{this.props.sign.wikiURL ? this.props.sign.wikiURL.replace("http://", "").replace("https://", "") : "No wiki page, you should create one!"}</p>
            </div>
          </div>
          <div className={this.props.sign.paperSize == PaperSize.A5 ? "footer-item-right" : ""}>
            <DiscordQR />
          </div>
        </div>
        {
          this.props.sign.paperSize == PaperSize.A5 ? (
            <div className="sign-footer-tiny">
              <p>Changes needed? Edit this at ddikman.github.io/machine-sign.</p>
            </div>
          ) : null
        }
      </>
    );
  }
}

function PreviewSection({ section, useHorizontalList }: { section: Section, useHorizontalList: boolean }): JSX.Element | null {
  if (!section.enabled) return null;

  if (section instanceof SectionMaterials) return PreviewSectionMaterials({ section, useHorizontalList });
  else if (section instanceof SectionFreeText) return PreviewSectionFreeText({ section });
  //else if (section instanceof SectionOutOfOrder) return PreviewSectionOutOfOrder({ section });
  else if (section instanceof SectionSafety) return PreviewSectionSafety({ section });
  else if (section instanceof SectionMaintenance) return PreviewSectionMaintenance({ section });
  else if (section instanceof SectionCleanup) return PreviewSectionCleanup({ section });
  else throw new Error("Unexpected section type " + typeof (section));
}

export const PreviewSign = ({ sign, id }: { sign: Sign, id: string | null }) => {
  if (sign.outOfOrder) {
    return (
      <div className="sign-root">
        <SignHeader sign={sign} />
        <SignOutOfOrder sign={sign} />
        <PreviewSignFooter sign={sign} id={id} />
      </div>
    );
  }

  const sections = sign.sections;
  let useHorizontalList = Math.max((sections.prohibitedMaterials.enabled ? sections.prohibitedMaterials.materials.length : 0), (sections.allowedMaterials.enabled ? sections.allowedMaterials.materials.length : 0)) > 4;
  useHorizontalList = useHorizontalList || (sections.prohibitedMaterials.enabled && sections.prohibitedMaterials.materials.some(v => v.label.length > 22));
  useHorizontalList = useHorizontalList || (sections.allowedMaterials.enabled && sections.allowedMaterials.materials.some(v => v.label.length > 22));

  const arr = [
    sections.safety,
    sections.allowedMaterials,
    sections.prohibitedMaterials,
    sections.quickStart,
    sections.cleanup,
    sections.maintenance,
  ];
  return (
    <div className={"sign-root " + (sign.paperSize == PaperSize.A4 ? "a4" : "a5")}>
      <SignHeader sign={sign} />
      <SignAccess sign={sign} />
      {arr.map((section, i) => <PreviewSection key={i} section={section} useHorizontalList={useHorizontalList} />)}
      <PreviewSignFooter sign={sign} id={id} />
    </div>
  );
};
