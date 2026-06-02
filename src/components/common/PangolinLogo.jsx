export default function PangolinLogo({ size = 80 }) {
  return (
    <img
      src="/nexus-ai/android-chrome-512x512.png"
      width={size}
      height={size}
      alt="NexusAI"
      style={{ display: 'block', objectFit: 'contain' }}
      draggable={false}
    />
  )
}
