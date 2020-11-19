# login 방식 정리

## 이메일로 로그인 (bitbucket 방식 clone)

( 참고 : email, password 동시에 받고 submit X)

signedIn = none (시작), false (미가입 user db X), true (가입 user db O)

### workflow

-   이메일 받고 submit -> is exist [users] db? -> return signedIn true / false
    -   login.js -> ... -> users.py auth_start
-   password 받고 submit -> is match password with [users] db? - yes -> return { user : xxx , access_token} - no -> return { error : '암호가 잘못되었습니다.'}
    -   login.js -> ... -> users.py auth



```
export const submitEmail = ({ email }) => async dispatch => {
export const submitPassword = ({ email, password }) => async dispatch => {
```

code: 0
message: null
success: true
validationErrors: null

check-username

csrfToken: 14d0a78cef937ca96b11ef531ff28ed361384859
username: jw1234@btowin.co.kr

aaCompatible: false
action: "no_action"
