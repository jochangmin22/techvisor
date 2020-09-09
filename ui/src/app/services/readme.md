# 로그인 과정

-   이메일 입력 -> 계속

## 로그인 과정 작업추적

-   loginslice > submitLoginEmail
-   jwtService.js > signInWithEmail
-   users.py > auth_start
-   users db 이메일 유무 return (signedIn : boolean)
-   loginslice > dispatch(setSignedIn(가입여부 ; true or false));

# 인증이메일 작업과정

-   인증이메일 클릭
-   register UI 이동
-   이동 하자마자 registerToken 생성 · 저장
-   이름, 이메일, 비밀번호 입력
-   폼값 validate
-   registerToken validate
-   token decode.email로 중복계정 check
-   users, userProfile 생성
-   access_token 생성, 쿠키 set
-   return { user: { id, username, displayName }, token }

## 인증이메일 작업추적

-   인증메일 클릭
-   인증링크는 UI register 링크 -> ui/main/register/Register.js
-   initial render로 register_token 받기

    -   registerSlice > getResigterToken
    -   jwtService.js > getToken
    -   verify/\${code} axios를 거쳐서
    -   users.py > auth_verify -> used, expired 확인 거쳐서 {'email': '', 'register_token' : ''} return
    -   setRegisterToken 으로 redux에 저장

-   이름, 이메일, 비밀번호 폼 값 입력
-   폼 submit
    -   registerSlice > submitRegister
    -   jwtService.js > createUser
    -   register axios 거쳐서
    -   users.py > register -> users db에 이메일 중복없으면 생성하고 {'email': '', 'access_token' : ''} return
