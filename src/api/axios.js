// axios.js
import axios from 'axios';

/**
 * 1) Axios 인스턴스 생성
 *    - baseURL: http://localhost:8080/api
 *    - 기본 헤더: Content-Type: application/json
 *    - 인터셉터: 공개 경로(/login, /signup, /refresh-token) 제외하고, 
 *      나머지 요청에 자동으로 accessToken을 붙여줌
 */
const instance = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
    // Authorization: `Bearer ${localStorage.getItem('accessToken')}`
  },
});

// 요청 인터셉터 등록
instance.interceptors.request.use(
  (config) => {
    // 공개 요청 경로 (토큰 없이 호출해야 하는 엔드포인트)
    const publicPaths = ['/login', '/signup', '/refresh-token'];

    // 요청 URL이 publicPaths 중 하나로 끝나면, 헤더(Append Authorization) 없이 그대로 반환
    if (publicPaths.some((path) => config.url.endsWith(path))) {
      return config;
    }

    // 그 외 요청에는 localStorage에서 accessToken을 꺼내서 헤더에 붙임
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


/**
 * 2) 인증 관련 API 함수들
 */

// 로그인: /login
//  - 성공 시 response.data.content에 아래 필드가 있다고 가정
//    { access_token, refresh_token, access_token_expiry, refresh_token_expiry, user_id, user_email }
export async function login(email, password) {
  try {
    const response = await instance.post('/login', { email, password });
    const {
      access_token,
      refresh_token,
      access_token_expiry,
      refresh_token_expiry,
      user_id,
      user_email,
    } = response.data.content;

    console.log('login 응답: ', response.data.content);
    console.log('user_id 값: ', user_id);

    // localStorage에 저장
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    localStorage.setItem('accessTokenExpiry', access_token_expiry);
    localStorage.setItem('refreshTokenExpiry', refresh_token_expiry);
    localStorage.setItem('userId', user_id);
    localStorage.setItem('userEmail', user_email);
    console.log("저장완료");

    return response.data.content;
  } catch (error) {
    console.error('로그인 오류:', error.response || error);
    throw error;
  }
}

// 회원가입: /signup
// signupDto 예시: { userEmail, userPassword, userName, userPhoneNumber, userNickname, ... }
export async function signup(signupDto) {
  try {
    const response = await instance.post('/signup', signupDto);
    return response.data;
  } catch (error) {
    console.error('회원가입 오류:', error.response || error);
    throw error;
  }
}

// 액세스 토큰 재발급: /refresh-token
//  - 서버에서 새로운 access_token과 expiry 정보를 내려준다고 가정
export async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('리프레시 토큰이 없습니다.');
    }

    const response = await instance.post('/refresh-token', {
      refreshToken,
    });

    // response.data.content에 { access_token, access_token_expiry }가 있다고 가정
    const { access_token, access_token_expiry } = response.data.content;

    // localStorage 갱신
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('accessTokenExpiry', access_token_expiry);

    return response.data.content;
  } catch (error) {
    console.error('토큰 재발급 오류:', error.response || error);
    throw error;
  }
}


/**
 * 3) 사용자 조회 관련 API 함수들
 */


export async function getCurrentUser() {
  try {
    // 1) localStorage에서 userId 가져오기
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('userId가 없습니다. 로그인 상태를 확인하세요.');
    }

    const userEmail = localStorage.getItem('userEmail');
    if(!userEmail) {
      throw new Error('userEmail이 없습니다. 로그인 상태를 확인하세요.');
    }

    // 2) /users/{id} 엔드포인트 호출
    const response = await instance.get(`/users/id/${userId}`);
    return response.data; 
    // 백엔드가 { user_id, user_email, user_name, user_created_at, … } 형태로 응답한다고 가정
  } catch (error) {
    console.error('내 정보 조회 오류:', error.response || error);
    throw error;
  }
}



// 내 정보 조회: /user
//  - 현재 로그인한 사용자의 프로필 정보를 가져옴
// export async function getCurrentUser() {
//   try {
//     const response = await instance.get('/user');
//     return response.data; // { user_id, user_email, user_name, user_created_at, ... }
//   } catch (error) {
//     console.error('내 정보 조회 오류:', error.response || error);
//     throw error;
//   }
// }

// ID로 사용자 조회: /users/{id}
//  - 엑세스 토큰이 있어야 할당된 권한 내에서 접근 가능
// export async function getUserById(userId) {
//   try {
//     const response = await instance.get(`/users/${userId}`);
//     return response.data; // { user_id, user_email, user_name, user_created_at, ... }
//   } catch (error) {
//     console.error(`ID(${userId})로 사용자 조회 오류:`, error.response || error);
//     throw error;
//   }
// }

// 이메일로 사용자 조회: /users/email/{email}
// export async function getUserByEmail(email) {
//   try {
//     const response = await instance.get(`/users/email/${encodeURIComponent(email)}`);
//     return response.data; // { user_id, user_email, user_name, user_created_at, ... }
//   } catch (error) {
//     console.error(`이메일(${email})로 사용자 조회 오류:`, error.response || error);
//     throw error;
//   }
// }

// 전체 사용자 조회 (관리자 전용): /users
export async function getAllUsers() {
  try {
    const response = await instance.get('/users');
    return response.data; // [ { user_id, user_email, ... }, { … }, … ]
  } catch (error) {
    console.error('전체 사용자 조회 오류:', error.response || error);
    throw error;
  }
}


/**
 * 4) 기타 필요한 API를 여기에 추가
 *    예: examSchedule, studySchedule 등 다른 엔드포인트도 필요하다면
 *    export async function getExamSchedules() { … }
 *    export async function createExamSchedule(dto) { … }
 *    등으로 함수 형태로 추가하시면 됩니다.
 */


// default export로 인스턴스도 함께 내보내서,
// 직접 instance.get/post 형식으로 호출해야 하는 경우에도 사용 가능
export default instance;