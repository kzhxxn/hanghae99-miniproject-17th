const body = document.querySelector('body');
const campingWrap = document.querySelector('.camping');
let CAMPING_LIST_NUM = 30;

// 캠핑 리스트 템플릿
function createCampingListTemp(ele, len) {
  campingWrap.innerHTML = ``;
  len = len > CAMPING_LIST_NUM ? CAMPING_LIST_NUM : len;

  for (let i = 0; i < len; i++) {
    const img = ele[i].img;
    const tag = ele[i].tag;
    const name = ele[i].name;
    const loc = ele[i].location;
    const view = ele[i].view;
    const gourl = ele[i].gourl;
    const article_temp = `
                  <article class="review__popUp">
                      <div>
                        <i></i>
                        <p class="review__question">
                           ${name}에 대해 어떻게 생각하시나요?
                        </p>
                      </div>
                      <table class="review__tb">
                        <thead>
                          <tr>
                            <th class="review__author">작성자</th>
                            <th class="review__comment">코멘트</th>
                            <th class="review__star">평점</th>
                          </tr>
                        </thead>
                        <tbody>
                        </tbody>
                      </table>
                      <footer class="ft__review">
                        <form class="review__form">
                          <p class="form__desc">별점과 이용후기를 남겨주세요.</p>
                          <p class="form__star">
                            <button class="star">
                              <i class="fas fa-star star_1"></i>
                            </button>
                            <button class="star">
                              <i class="fas fa-star star_2"></i>
                            </button>
                            <button class="star">
                              <i class="fas fa-star star_3"></i>
                            </button>
                            <button class="star">
                              <i class="fas fa-star star_4"></i>
                            </button>
                            <button class="star">
                              <i class="fas fa-star star_5"></i>
                            </button>
                          </p>
                          <p class="form__text">
                            <label for="write"></label>
                            <textarea
                              name=""
                              id="write"
                              cols="30"
                              rows="6"
                            ></textarea>
                          </p>
                          <button class="form__register">등록</button>
                        </form>
                      </footer>
                      <button class="btn__close">
                        <i class="fas fa-times"></i>
                      </button>
                    </article>
              `;
    const temp = `
                  <li class="camping__list clear">
                      <img
                          src="${img}"
                          alt="${name}"
                          class="camping__img"
                        />
                      <div class="camping__info">
                          <div class="camping__desc">
                              <p class="camping__tag">
                                ${
                                  tag
                                    ? `<span class="tab__title">연관태그</span>: <span class="tag__name">${tag}</span>`
                                    : '연관태그: 해당없음'
                                }
                              </p>
                              <p class="camping__name">${name}</p>
                              <p class="camping__loc">${loc}</p>
                          </div>
                          <div>
                              <a class="camping__link" href="${gourl}" target="_blank" data-btn='list_btn'>바로가기</a>
                              <button class="camping__review" data-btn='list_btn'>리뷰작성</button>
                              <span class="camping__view">조회수 : ${view}</span>
                          </div>
                      </div>
                      <div class="article__bg modal">
                          ${article_temp}
                      </div>
                  </li>
              `;
    campingWrap.innerHTML += temp;
  }
}

// 모달 창 열기
function openModal(ele) {
  const campingInfo = ele.parentElement.parentElement; // 캠핑 정보 카드
  const campingName = campingInfo.querySelector('.camping__name').textContent; //캠핑장 이름
  const targetModal = campingInfo.nextElementSibling; // 모달 창
  const btnClose = targetModal.querySelector('.btn__close');

  const formStar = targetModal.querySelector('.form__star');
  const formRegister = targetModal.querySelector('.form__register');

  const reviewTable = targetModal.querySelector('.review__tb>tbody');

  targetModal.classList.add('on');
  body.classList.add('stop__scroll');

  // 리뷰보기
  $.ajax({
    type: 'POST',
    url: '/show_reivew',
    data: {campName_give: campingName},
    success: function (response) {
      const reviews = response.reviews;

      if(reviews.length === 0) {  // 리뷰가 없을 시
        const temp = `
          <tr>
            <td colspan="3">리뷰가 없습니다.</td>
          </tr>
        `;
        reviewTable.innerHTML = temp;
      } else {
        reviewTable.innerHTML = ``; //리뷰초기화

        for(let i = 0; i < reviews.length; i++) {  // 리뷰가 있을 시
          const review_star = reviews[i].star;
          const review_comment = reviews[i].comment;
          const review_author = reviews[i].name;
          const temp = `
            <tr>
              <td>${review_author}</td>
              <td>${review_comment}</td>
              <td>${review_star}점</td>
            </tr>
          `;

          reviewTable.innerHTML += temp;
        }
      }
    },
  });

  // 모달 찾기 닫기
  btnClose.addEventListener('click', () => {
    closeModal(targetModal);
  });

  // 리뷰 별점 체크
  formStar.addEventListener('click', (event) => {
    const target = event.target;
    event.preventDefault();

    printStar(target);
  });

  // 리뷰 등록
  formRegister.addEventListener('click', (event) => {
    event.preventDefault();

    const target = event.target;
    const parent = target.parentElement;
    const star = parent.querySelectorAll('.star.on');
    const starNum = star.length;
    const comment = parent.querySelector('#write');
    const commentText = comment.value;
    let today = new Date().toISOString();

    reviewTable.innerHTML = ``;

    // 리뷰저장
    $.ajax({
      type: 'POST',
      url: '/review',
      data: {
        campName_give: campingName,
        comment_give: commentText,
        star_give: starNum,
        date_give: today,
      },
      success: function (response) {
        const reviews = response.reviews;

        reviews.forEach((review) => {
          const review_star = review.star;
          const review_comment = review.comment;
          const review_author = review.name;
          const temp = `
            <tr>
              <td>${review_author}</td>
              <td>${review_comment}</td>
              <td>${review_star}점</td>
            </tr>
          `;

          reviewTable.innerHTML += temp;
        });
      },
    });

    // 리뷰작성 버튼 클릭 시 리뷰작성 폼 초기화
    comment.value = ``;
    star.forEach((item) => {
      item.classList.remove('on');
    });
  });
}

function closeModal(ele) {
  ele.classList.remove('on');
  body.classList.remove('stop__scroll');
}

// 슬라이드 배너
function createBanner() {
  const banner = document.querySelector('.banner');
  const bannerLists = document.querySelectorAll('.banner > li');
  const bannerListWidth = bannerLists[0].getBoundingClientRect().width;
  const BANNER_COUNT = bannerLists.length;
  let curIdx = 0;

  banner.style.width = `${(BANNER_COUNT + 1) * 100}%`;
  bannerLists.forEach((list) => {
    list.style.width = `${100 / (BANNER_COUNT + 1)}%`;
  });

  // 자동 배너 작동
  setInterval(() => {
    if (curIdx <= 2) {
      banner.style.transform = `translateX(-${
        bannerListWidth * (curIdx + 1)
      }px)`;
      banner.style.transition = `transform 1s ease-out`;
    }

    if (curIdx === 2) {
      setTimeout(() => {
        banner.style.transform = `translateX(0)`;
        banner.style.transition = 'transform 0s ease-out';
      }, 1000);
      curIdx = -1;
    }

    curIdx++;
  }, 2000);
}

function getCampingList() {
  $.ajax({
    type: 'GET',
    url: '/camping',
    data: {},
    success: function (response) {
      const campInfos = response.campInfos;

      createCampingListTemp(campInfos, 30);
    },
  });
}

// 리뷰 목록 보기
function loadView() {}

// 별점 체크
function printStar(target) {
  const parents = target.parentElement.parentElement;
  const stars = target.className.split('_')[1];
  const nthStar = parents.querySelectorAll('.star > i');

  nthStar.forEach((item) => {
    item.parentElement.classList.remove('on');
  });

  for (let i = 0; i < stars; i++) {
    nthStar[i].parentElement.classList.add('on');
  }
}

// 캠핑 목록 소팅
function setSortEvent() {
  const sortLoc = document.querySelector('#sort_loc');
  const sortView = document.querySelector('#sort_view');
  const sortTheme = document.querySelector('#sort_theme');
  let descending = true;

  // 도시별 소팅
  sortLoc.addEventListener('change', (event) => {
    event.preventDefault();
    const city = event.target.value;

    $.ajax({
      type: 'POST',
      url: '/sort_city',
      data: { loc: city },
      success: function (response) {
        const sort_city = response.sort_city;

        if (sort_city.length <= 0) {
          alert('해당 지역에 관한 캠핑장이 없습니다.');
          return false;
        }
        createCampingListTemp(sort_city, sort_city.length);
      },
    });
  });

  // 테마별 소팅
  sortTheme.addEventListener('change', (event) => {
    event.preventDefault();
    const theme = event.target.value;

    $.ajax({
      type: 'POST',
      url: '/sort_theme',
      data: { theme: theme },
      success: function (response) {
        const sort_theme = response.sort_theme;

        createCampingListTemp(sort_theme, sort_theme.length);
      },
    });
  });

  // 리뷰수 소팅
  sortView.addEventListener('click', (event) => {
    event.preventDefault();
    if (descending) {
      order = 'descending';
      descending = false;
    } else {
      order = 'ascending';
      descending = true;
    }

    $.ajax({
      type: 'POST',
      url: '/sort_order',
      data: { order: order },
      success: function (response) {
        const sort_order = response.sort_order;

        createCampingListTemp(sort_order, sort_order.length);
      },
    });
  });
}

setSortEvent();

window.addEventListener('load', () => {
  getCampingList();
  createBanner();
});

// 캠핑 리스트를 감싸고있는 camping에 이벤트 위임
campingWrap.addEventListener('click', (event) => {
  const target = event.target;

  if (target.dataset.btn !== 'list_btn') {
    return false;
  }

  openModal(target);
});