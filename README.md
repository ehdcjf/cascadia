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
1.  pointer down : select tile
2.  overlay  possiblePath  (yellow)
3.  pointer move:  paint possiblePath  selectedTile
4.  pointer down:  show button [cancle] [confirm] [rotateCW]  [rotateCCW]
5.  button actions
	cancle: delete possiblePath overlay=> possiblePath initialize material; all idleToken visibility 









