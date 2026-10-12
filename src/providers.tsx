import {
  NotificationProvider,
} from "./context/NotificationContext.tsx";

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
}