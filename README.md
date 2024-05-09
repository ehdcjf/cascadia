0503
mapData에서 타일종류, 타일 회전 ,타일 위치 같은 경우에는 바뀔 일이 없고
바뀔 수 있는 거는 야생동물,
그리고 주변에 타일이 추가될 때, 이웃 타일
이걸 바로바로 갱신해주면. 이웃찾을 때마다.. mapdata에서 이웃타일 이 있는건지 없는건지 확인하지 않아도 됨.
그리고 타일 아이디랑, 토큰 아이디는 어차피 Scene에서 찾을 수가 있어서 굳이.. mapdata에 저장하지 않아도 될듯

=>

mapData에 들어가는 value 변경
Coordinates 삭제 , 원래 거기 있던 기능은 board로 옮기고,

tileID에서 qrs 취하는 함수를 만들지.. 아니면 mapData에 qrs 까지 담을지. 고민하고 나중에 변경하면 될듯

0506
ABCD 그룹이 아니라 각 동물마다 나눠야 관리가 쉬울듯

0507

1. pointer down : select tile
2. overlay possiblePath (yellow)
3. pointer move: paint possiblePath selectedTile
4. pointer down: show button [cancle] [confirm] [rotateCW] [rotateCCW]
5. button actions
   cancle: delete possiblePath overlay=> possiblePath initialize material; all idleToken visibility

0509

솔방울을 사용하지 않은 경우
타일 배치 완료 버튼 클릭 후 바로 토큰이 선택됨.

1. 토큰이 배치불가능한 경우 버릴 건지 물어봐야함.
   1-1) 버린 경우 => 타일 배치
   1-2) 안 버릴 경우 타일 배치 취소
2. 배치 가능한 경우 => 타일 배치

솔방울을 사용한 경우 1.타일 배치 완료 => 타일 배치 2.토큰 선택
토큰 배치 불가능 한 경우 물어봐야함
버릴 경우
안버릴 경우 => 타일 배치 취소

토큰까지 모두 완료된 경우에만 타일 배치 하면 됨.

토큰 선택이 안된 경우 타일 배치를 취소하는게 더 쉬움

0510
클릭 이벤트 전에 무브이벤트감지되어 버그 발생하는 경우가 있음
상태를 만들어서 특정 이벤트는 특정 상태에서만 작동할 수 잇도록 해야 함.

그리고... 솔방울 토큰도 만들고,

팝업을 보드 위에 띄우는 게 아니라 카메라에 고정해야할듯.
