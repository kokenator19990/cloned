export function generateStaticParams() {
  return [{ profileId: 'demo' }];
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
