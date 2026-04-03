export default function ResultIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      width="19"
      height="20"
      viewBox="0 0 19 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.7094 0.750214H5.04043C2.01943 0.750214 0.125427 2.88921 0.125427 5.91621V14.0842C0.125427 17.1112 2.01043 19.2502 5.04043 19.2502H13.7084C16.7394 19.2502 18.6254 17.1112 18.6254 14.0842V5.91621C18.6254 2.88921 16.7394 0.750214 13.7094 0.750214Z"
        fill={isActive ? '#3B27DF' : '#9C9C9C'}
      />
      <path
        d="M5.81494 10.0002L8.18894 12.3732L12.9349 7.62723"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
