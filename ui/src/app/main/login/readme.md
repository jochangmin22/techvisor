# login 방식 정리

## 이메일로 로그인 (bitbucket 방식 clone)

( 참고 : email, password 동시에 받고 submit X)

signedIn = none (시작), false (미가입 user db X), true (가입 user db O)

### workflow

-   이메일 받고 submit -> [users] db check -> signedIn = true / false
    -   login.js -> ... -> users.py def [email]
        -   false -> 가입 이메일 링크 -> 클릭 -> Invite.js 폼 -> 이름, 암호 더 입력하고 로그인
        -   true -> 암호 폼 -> 로그인
            -   users.py def [password] -> def[access_token]
