**리그오브 레전드 내전 팀 가르기 웹 서비스**

스크리머 제공 기능:
- 최대 10명까지 동시 접속 가능한 채널 링크 생성
- 실시간 채팅
- 라이엇 API를 통한 참가자의 소환사 정보 공유
- 드래프트 픽 가르기(두 명의 주장이 가위바위보로 선을 정하고 순서대로 1/2/2/1명씩 번갈아가며 팀원으로 뽑는 방식, 10명 참여자 필요)
- 올랜덤 가르기(인원 수와 관계 없이 완전 무작위)
- 티어, 라인 및 승률을 분석한 자동 밸런스 팀 가르기 (업데이트 예정)

***Backend:***
- Django(fullstack), django-channels, daphne, gunicorn, NginX
- RDBMS-Postgresql, NoSQL-redis

***Frontend:***
- HTML, CSS(Bootstrap), Javascript(Vanilla, JQuery)


