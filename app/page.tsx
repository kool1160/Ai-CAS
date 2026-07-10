import { AuthGate } from '../features/woc/components/AuthGate';
import { LaunchSplash } from '../features/woc/components/LaunchSplash';

export default function Home() {
  return (
    <LaunchSplash>
      <AuthGate />
    </LaunchSplash>
  );
}
