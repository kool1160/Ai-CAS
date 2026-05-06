import { WocApp } from '../features/woc/components/WocApp';
import { LaunchSplash } from '../features/woc/components/LaunchSplash';

export default function Home() {
  return (
    <LaunchSplash>
      <WocApp />
    </LaunchSplash>
  );
}
