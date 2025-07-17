import React, { useEffect, useState, useMemo } from "react";
import { useUnloadingParcels } from "../../../hooks/useWaybills";
import { createChannelInterface } from "../../../utils/broadcastChannel";
import type { ParcelStatus, Parcel } from "../../../types/waybill";
import type { BroadcastMessage } from "../../../types/broadcast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { Badge } from "../../../ui/badge";

interface UnloadingParcel extends Parcel {
  createdAt: string;
  updatedAt: string;
}

export default function DashboardUnloadingPage() {
  const { data: parcelsData, isLoading, refetch } = useUnloadingParcels();
  const [parcels, setParcels] = useState<UnloadingParcel[]>([]);

  // 브로드캐스트 채널 연결 (Factory 앱과 동일한 방식)
  const channel = useMemo(() => createChannelInterface("factory-events"), []);

  useEffect(() => {
    if (parcelsData?.parcels) {
      // Parcel을 UnloadingParcel로 변환 (createdAt, updatedAt 추가)
      const unloadingParcels: UnloadingParcel[] = parcelsData.parcels.map(
        (parcel) => ({
          ...parcel,
          createdAt: parcel.processedAt, // processedAt을 createdAt으로 사용
          updatedAt: parcel.processedAt, // processedAt을 updatedAt으로 사용
        })
      );
      setParcels(unloadingParcels);
    }
  }, [parcelsData]);

  // 메시지 수신 처리 (Factory 앱과 동일한 방식)
  useEffect(() => {
    const handleMessage = (data: BroadcastMessage) => {
      const { msg, waybillId, category, severity } = data;

      if (category === "PROCESS" && msg === "하차된 물건") {
        // 하차 완료된 운송장 상태 업데이트
        setParcels((prev) =>
          prev.map((parcel) =>
            parcel.waybillId === waybillId
              ? { ...parcel, status: "UNLOADED" as ParcelStatus }
              : parcel
          )
        );
      } else if (category === "ALARM" && severity === "ERROR") {
        // 작업자 고장으로 인한 파손 처리
        if (msg.includes("작업자 고장")) {
          // 가장 오래된 운송장을 파손 처리 (실제로는 더 정교한 로직 필요)
          setParcels((prev) => {
            const oldestParcel = prev.find(
              (p) => p.status === "PENDING_UNLOAD"
            );
            if (oldestParcel) {
              return prev.map((parcel) =>
                parcel.id === oldestParcel.id
                  ? { ...parcel, status: "ACCIDENT" as ParcelStatus }
                  : parcel
              );
            }
            return prev;
          });
        }
      }
    };

    const unsubscribe = channel.subscribe(handleMessage);

    return unsubscribe;
  }, [channel]);

  const getStatusBadge = (status: ParcelStatus) => {
    switch (status) {
      case "PENDING_UNLOAD":
        return <Badge variant="secondary">하차 대기</Badge>;
      case "UNLOADED":
        return (
          <Badge variant="default" className="bg-green-500">
            하차 완료
          </Badge>
        );
      case "ACCIDENT":
        return <Badge variant="destructive">파손</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR");
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">하차 예정 운송장</h1>
          <p className="text-muted-foreground">
            하차 대기 중인 운송장 목록을 실시간으로 확인할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">하차 예정 운송장</h1>
        <p className="text-muted-foreground">
          하차 대기 중인 운송장 목록을 실시간으로 확인할 수 있습니다.
        </p>
      </div>

      <div className="bg-card rounded-lg border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">운송장 목록</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                총 {parcels.length}개
              </span>
              <button
                onClick={() => refetch()}
                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                새로고침
              </button>
            </div>
          </div>

          {parcels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              하차 대기 중인 운송장이 없습니다.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>운송장 번호</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>생성일시</TableHead>
                  <TableHead>업데이트일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parcels.map((parcel) => (
                  <TableRow key={parcel.id}>
                    <TableCell className="font-medium">
                      {parcel.waybillId}
                    </TableCell>
                    <TableCell>{getStatusBadge(parcel.status)}</TableCell>
                    <TableCell>{formatDate(parcel.createdAt)}</TableCell>
                    <TableCell>{formatDate(parcel.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <div className="mt-6 bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">실시간 업데이트</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• 하차 완료 시: 상태가 "하차 완료"로 변경됩니다</p>
          <p>• 작업자 고장 시: 가장 오래된 운송장이 "파손" 상태로 변경됩니다</p>
          <p>• 브로드캐스트 채널을 통해 실시간으로 상태가 업데이트됩니다</p>
        </div>
      </div>
    </div>
  );
}
