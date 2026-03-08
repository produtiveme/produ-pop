import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon(props: IconProps) {
  return <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" {...props} />;
}

export function LogoMark(props: IconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <rect width="24" height="24" rx="6" fill="currentColor" />
      <path d="M7 7.5h4v4H7zM13 7.5h4v9h-4zM7 13.5h4v4H7z" fill="#fff" />
      <path d="M11 11.5h2v2h-2z" fill="#fff" />
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
    </BaseIcon>
  );
}

export function LibraryIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 6.5h12M7 4v16M11 8v12M15 6v14M19 4.5V19" />
    </BaseIcon>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4.5 4.5 18h15z" />
      <path d="M12 9v4.5M12 16.5h.01" />
    </BaseIcon>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M16.5 19v-1.2A3.8 3.8 0 0 0 12.7 14h-1.4a3.8 3.8 0 0 0-3.8 3.8V19" />
      <circle cx="12" cy="8" r="3" />
      <path d="M18.5 19v-1a3.1 3.1 0 0 0-2.2-3M17 6.8a2.8 2.8 0 0 1 0 5.4" />
    </BaseIcon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 1 0 12 8.5z" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.8 1.8 0 0 1-3.6 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1.8 1.8 0 0 1 0-3.6h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.8 1.8 0 0 1 2.5-2.5l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1.8 1.8 0 0 1 3.6 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a1.8 1.8 0 0 1 0 3.6h-.2a1 1 0 0 0-.9.6Z" />
    </BaseIcon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </BaseIcon>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 3.5v3M17 3.5v3M4.5 8h15M5.5 5.5h13a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z" />
    </BaseIcon>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M2.8 12s3.2-5.5 9.2-5.5 9.2 5.5 9.2 5.5-3.2 5.5-9.2 5.5S2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </BaseIcon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 5v14M5 12h14" />
    </BaseIcon>
  );
}

export function DuplicateIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="9" y="9" width="10" height="10" rx="2" />
      <path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    </BaseIcon>
  );
}

export function SaveIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5.5 5.5h11l2 2v11a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z" />
      <path d="M8 5.5v5h8v-5M9 19v-5.5h6V19" />
    </BaseIcon>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 16V6M8.5 9.5 12 6l3.5 3.5M5 18.5h14" />
    </BaseIcon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </BaseIcon>
  );
}

export function TuneIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 6h9M16 6h4M8 12h12M4 12h1M4 18h13M19 18h1" />
      <circle cx="14" cy="6" r="2" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="17" cy="18" r="2" />
    </BaseIcon>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4.5" y="5.5" width="15" height="13" rx="2" />
      <circle cx="10" cy="10" r="1.5" />
      <path d="m6.5 16 4.2-4.2a1 1 0 0 1 1.4 0l1.4 1.4a1 1 0 0 0 1.4 0l2.7-2.7a1 1 0 0 1 1.4 0l.6.6" />
    </BaseIcon>
  );
}

export function VideoIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4.5" y="6.5" width="11" height="11" rx="2" />
      <path d="m15.5 10 4-2v8l-4-2z" />
    </BaseIcon>
  );
}

export function DescriptionIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 4.5h7l3 3v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-14a1 1 0 0 1 1-1Z" />
      <path d="M14 4.5v3h3M9 11.5h6M9 15h6" />
    </BaseIcon>
  );
}

export function CheckboxIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4.5" y="4.5" width="15" height="15" rx="2" />
      <path d="m8 12 2.5 2.5L16 9" />
    </BaseIcon>
  );
}

export function SplitIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4.5v6M12 10.5 6 16.5M12 10.5l6 6M6 16.5h3.5M14.5 16.5H18" />
    </BaseIcon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14M13 7l6 5-6 5" />
    </BaseIcon>
  );
}

export function CursorIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m6 4 11 8-5 1.2L13.5 20l-2.6 1-1.5-6.7L6 15z" />
    </BaseIcon>
  );
}

export function CircleNodeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="7.5" />
    </BaseIcon>
  );
}

export function RectangleNodeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="5.5" y="7" width="13" height="10" rx="1.5" />
    </BaseIcon>
  );
}

export function DiamondNodeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4.5 19.5 12 12 19.5 4.5 12z" />
    </BaseIcon>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M14 7V5.5a2 2 0 0 0-2-2H6.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2H12a2 2 0 0 0 2-2V17" />
      <path d="M10 12h10M16.5 8.5 20 12l-3.5 3.5" />
    </BaseIcon>
  );
}
