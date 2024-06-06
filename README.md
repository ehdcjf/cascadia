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

## Replace Duplicate Tokens - 3tokens

Since there are three duplicate tokens, you have the option to replace them with three new tokens. (The three replaced tokens will go back into the supply and all tokens reshuffled.)

Note: You can only do this once per turn.

Close | Replace Duplicate Tokens

## Wipe Tokens

Since there are only <span>wildlife</span> tokens, they will all be discarded,
four new tokens will be generated, and the replaced <span>wildlife</span>
tokens will go back into the supply and shuffled.

Close

## Use Nature Token

You may spend one of your Nature Tokens one of the following two ways:
1 - To take any one tile and and any one token available (they do not need to be a combination / on the same row).
2 - To wipe ANY number of wildlife tokens from the market and refill before you choose your combination.

Players can always use as many nature tokens as they want on their turn.
Any nature tokens left at the end of the game are worth 1 point.

Note: You cannot undo this action once you confirm.

Close | Pick any tile / token | Clear any number of tokens | Clear ALL tokens

## No tiles

There are no tiles that can take a <span>wildlife</span> token, so this token will be removed from the game if you go ahead.
Click "Cancel" to choose another Tile + Token combination, or click "Confirm" to remove the token.

Cancel | Confirm

## No tiles Nature

here are no tiles that can take a <span>wildlife</span> token, so this token will be removed from the game if you go ahead.
Click "Cancel" to choose another Token, or click "Confirm" to remove the token.

Cancel | Confirm

# Place Tile

First choose a tile to place.

Close

# Choose Token

Now choose a token to place.

Close

# Delete Token

Choose which displayed wildlife tokens you would like to clear by clicking on them (click on them again to deselect the token).
Once finalized, press the "Clear Tokens" button to replace the chosen tokens with new tokens from the supply.

Close

# Calculate Score

The last tile and token has been placed and the scoring phase will now begin!

Calculate Score

# 상태

## READY

## START

useRefill: boolean
useNature: boolean
canRefill: boolean
canPickTile: boolean
canPickToken: boolean
canUndo: boolean
canDrawTile: boolean
natureToken: number
turnLefts: number

# 이벤트

## _END_ (토큰을 입력한 경우 실행)

0. 게임 상태를 **Ready** 로 변경한다.

1. TurnLefts 를 1 감소시킨다.

      1. TurnLefts 가 0이면 _Cacluate_ 이벤트를 실행하고 종료한다.

2. useRefill을 false로 설정한다.
   canRefill을 false 로 설정한다.

3. GameInfo 모달의 정보를 갱신한다.
4. _Tile proccess_, _Token Process_ 이벤트를 실행한다.

## _Tile Process_

1. 사용한 타일을 제거한다.
2. 가장 멀리 있는 타일을 제거한다.
3. 새로운 타일을 꺼낸다.

## _Token Process_

1. 사용한 토큰을 제거한다.
2. 가장 멀리있는 토큰을 제거한다.
3. 새로운 토큰을 꺼낸다.
      1. 동일한 토큰이 4개 나오면 _Duplicate All_ 이벤트를 실행한다.
      2. 동일한 토큰이 3개 나오면 _Can Refill_ 이벤트를 실행한다.
      3. 위 경우가 아닐 경우 _Start_ 이벤트를 실행한다.

## _Duplicate All_

1. [Duplicate All] 모달을 띄운다.
2. close 버튼을 누르면 0. 모달을 숨긴다.
      1. 중복된 토큰을 임시보관한다.(UI에서는 slideLeft);
      2. 토큰을 섞는다.
      3. 토큰을 4개 꺼낸다.
            1. 동일한 토큰이 4개 나오면 임시보관중이던 토큰 다시 주머니에 넣고 _Duplicate All_ 이벤트를 실행한다.
            2. 동일한 토큰이 3개 나오면 canRefill을 true로 설정하고 _Start_ 이벤트를 실행한다.
            3. 위 경우가 아닐 경우 _Start_ 이벤트를 실행한다.

## _Start_

1. Game의 상태를 **Start** 로 변경한다.
2. default 모달을 띄운다.
3. canPickTile 을 true 로 설정한다.

## _Pick Tile_

1. selectedTile을 타일 정보로 설정한다.
2. canDrawTile 를 true 로 설정한다.
3. 모든 타일의 edge를 지운다. 선택된 타일의 edge를 노란색으로 변경한다.

## _Put Tile_

3. Game의 상태를 **Tile Action** 으로 변경한다
1. targetTileID를 릭된 타일의 TileID로 설정한다.1. tileAction 모달을 띄운다.

## Pick Token

1. selectedToken을 해당 토큰으로 설정한다.

1-1. 해당 토큰이 배치 불가능하면 _Choice_ 이벤트를 실행한다.

1-2. 해당 토큰이 배치 가능하면 canDrawToken을 true로 설정한다.

## _Put Token_

1. targetTileID를 wildlife 정보를 selectedToken의 wildlife 정보로 설정한다.
2. _End_ 이벤트를 실행한다. throwToken:false;

## _Undo Tile_

0. targetTileID의 tile 정보를 초기화한다.
1. targetTileID를 null로 설정한다.
2. selectedTile을 null 로 설정한다.
3. 모든 타일의 edge를 지운다.
4. canPickTile 을 true 로 설정한다.
5. Game의 상태를 **Start** 으로 변경한다.

## _Cancle Tile_

1. tileAction 모달을 지운다.
2. _Undo Tile_ 이벤트를 실행한다.

## _Confirm Tile_

1. canUndo 를 true 로 설정한다.
2. tileAction 모달을 지운다.
3. canDrawTile을 false 로 설정한다.
4. canPickTile 을 false 로 설정한다.

useNature == false

1. 해당 라인의 token을 선택한다.

      1. 해당 Token이 배치불가능하다면
      2. _Choice_ 이벤트를 실행한다.

      3. 해당 토큰이 배치가능하다면
      4. targetTileID의 tile 의 속성을 habitat으로 변경한다.
      5. canDrawToken을 true로 설정한다.

useNature == true

1. selectToken 모달을 띄운다.

## _Rotate CW Tile_

1. targetTile 위치의 Tile을 시계방향으로 회전한다.
2. 회전 정보를 입력한다.

## _Rotate CCW Tile_

1. targetTile 위치의 Tile을 반시계방향으로 회전한다.
2. 회전 정보를 입력한다.

## _No Placement_

1. Game 상태를 **Choice** 로 변경한다.
2. Choice 모달을 띄운다.

      1. Cancle 을 클릭한 경우 _Cancle Tile_ 이벤트를 실행한다.
      2. Confirm 이벤트를 실행한 경우 _Throw Token_ 이벤트를 실행한다.

## _Throw Token_

1. 선택된 token leftslide
2. 선택된 tile을 rightslide
3. targetTileId의 속성을 habitat으로 변경한다.
4. _END_ 이벤트를 실행한다.(throwToken==true)

# _Duplicate Three_

1. canRefill 을 true 로 설정한다.

2. _Start_ 이벤트를 실행한다.

# Modal

## default

1. canRefill 이 true 이고. useRefill 이 false 라면 default 모달의 Refill 버튼의 visibility 를 1 로 설정한다.
2. natureToken>0 이면 Use NatureToken 버튼의 visibility를 1로 설정한다.
3. canUndo 가 true 이면 Undo 버튼의 visibility를 1로 설정한다.

## tile action

cancle _Cancel Tile_ 이벤트를 실행한다.
confirm _Confirm Tile_ 이벤트를 실행한다.
rotate cw _Rotate CW Tile_ 이벤트를 실행한다.
rotate ccw _Rotate CCW Tile_ 이벤트를 실행한다.

## duplicateAll

close _Duplicate All_ 이벤트를 실행한다.

## duplicateThree

close 모달을 숨긴다.
confirm _Duplicate Three_ 이벤트를 실행한다.

## Choice

cancel cancel 이벤트
confirm

## selectToken

1. close: canPickToken true;

=================================================================
버튼을 전부 정리해야겠음

주머니-토큰: 토큰 선택,
주머니-타일: 타일 선택,
보드-타일: 선택된 타일 입력, 선택된 토큰 입력

되돌리기: 타일선택 취소, 타일 입력 취소, 토큰 선택 취소
중복3: 중복3모달
솔방울토큰 사용: 솔방울토큰 사용 모달
