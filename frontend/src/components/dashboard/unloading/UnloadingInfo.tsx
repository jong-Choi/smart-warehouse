export const UnloadingInfo: React.FC = () => {
  return (
    <div className="mt-6 bg-card rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">실시간 업데이트</h3>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>• 하차 완료 시: 상태가 "하차 완료"로 변경됩니다</p>
        <p>• 작업자 고장 시: 가장 오래된 운송장이 "파손" 상태로 변경됩니다</p>
        <p>• 브로드캐스트 채널을 통해 실시간으로 상태가 업데이트됩니다</p>
      </div>
    </div>
  );
};
