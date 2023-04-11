// Unsplash Access Key
  // SwaSgEIG85WQkw2yD2X_ESc5B_dDzn6PMXoFJiTgVv4
  // https://api.unsplash.com/photos/?client_id=SwaSgEIG85WQkw2yD2X_ESc5B_dDzn6PMXoFJiTgVv4
// Unsplash Secret Key
  // CbBeO6ab9ZzSiN1Ikt4NHbgD9gJn5NhG0MnuhttXLsg
// 以上内容已经加入 .env

import React, { useState, useEffect } from 'react'
import { FaSearch } from 'react-icons/fa'
import Photo from './Photo'
const clientID = `?client_id=${process.env.REACT_APP_ACCESS_KEY}` 
// 每次设置完 .env, 都应该重启 npm
const mainUrl = `https://api.unsplash.com/photos/`
const searchUrl = `https://api.unsplash.com/search/photos/`

function App() {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  // 目前一共 fetch 几页？是否需要 scroll + fetch 新的？需要的话，则在此 state value 上增加。
  const [page, setPage] = useState(0); 
  // 为了配合 handleSubmit 中去除 fetchPhotos 的操作，
  // page 的 default value 设置为 0。


  // 从 Unsplash 的 API doc 中寻找 search 的用法，得知 search 的 params 是 query。
  const [query, setQuery] = useState(''); // 继续前往 forms 规定 query input

  const fetchPhotos = async () => {
    setLoading(true);
    let url;
    const urlPage = `&page=${page}`
    const urlQuery = `&query=${query}`
    // 仅当 query 存在内容时，才执行 queryUrl。
    if (query) {
      url = `${searchUrl}${clientID}${urlPage}${urlQuery}` // 搜索页面，也需要多页显示
      // searchUrl 的一个问题：fetch 时，返回的 data 是一个 object，其中的 results 才是正式的 data array.
    } else { // 不存在 query 内容时，则多页显示。
      url = `${mainUrl}${clientID}${urlPage}`;
    }
    // 设置过 search 之后，也应该在 handleSubmit 中最终设置一个 fetch，
    // 否则没有 state 的 reset，页面不会自动重新 加载 + fetch
    
    try {
      const response = await fetch(url); // page 数随着 scroll down 的次数增加而增加！
      // 在 network 的 Fetch/XHR 部分，可以看到这些 page 逐渐增加的 fetch 来源！
      const data = await response.json();
      console.log(data);
      // 在原 state value 基础上，再增加本次新 fetch 的内容。
      // 如果不添加 ...oldPhotos，则页面上的内容会不断 fetch、不断更换，无法正常显示。
      setPhotos((oldPhotos) => {
        if (query && page === 1){ // Gotcha 1: 若 query 且是第一页，则应抛去 default page 不用。
          return data.results;
        } else if (query) {
          return [...oldPhotos, ...data.results]; // 等到首次延续 query loading 时，才使用 oldPhotos
          // Gotcha 2: 
          // 经测试后又发现，如果中途变换 query，例如 cat pic -> dog pic，
          // 则 dog pic 会紧跟 cat 的 oldPhotos 显示，而非新开页面。
          // 应规定：重开搜索，则 page 重置。
        } else {
          return [...oldPhotos, ...data]; // 设置 photoArray。两部分都需要 spread operator！
        }
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  useEffect(() => {
    fetchPhotos();
    // 因为设置了两个 useEffect，且拥有不同的 dependency list，所以要添加下面这行。
    // eslint-disable-next-line
  },[page]) // 为何设置好 page + setPhotos 后仍然没有反应？
  // 因为没有设置 fetching useEffect！
  // 当 page 发生变化时，则重新 fetch 一次！
  // 在 NetWork 的 Fetch/XHR 中可以看到 这些 page 渐增的 fetch request！ 

  // 设置一个新的 useEffect，包含一个 event Listener，
  // 用以监测 scroll：是否 scroll 到底了？
  useEffect(() => {
    const event = window.addEventListener('scroll', () => {
      // 试验时发现：
        // innerHeight 就是目前窗口的高度；(维持 559 不变)
        // scrollY 是累计起来的滚动距离；（从 0 逐渐增加到 2826）
        // body scrollHeight 是整个页面长图的 高度（完全滚动完的情况下，数值为 3385）
      // 当 innerHeight + scrollY 的值大于 bodyHeight 时，
        // 说明滚动到底部了，可以新加载一个 batch
          // console.log(`innerHeight ${window.innerHeight}`);
          // console.log(`scrollY ${window.scrollY}`);
          // console.log(`body height ${document.body.scrollHeight}`);

      // 已经在 loading 时，就不再进行新的 fetch，
      // 即：仅有在 loading 为 false 时，才进行新的 fetch.
      if (!loading && window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
        // 如何 fetch 一页新的 photos? 可查看 unsplash 官网的 list Photos.
            // console.log("Hit Bottom. Begin Fetching!");
        // 每次 scroll down，多 fetch 1 page！
        setPage((oldPage) => {return oldPage + 1});
      }
    });
    return () => window.removeEventListener('scroll',event); // 使用后及时 remove
    // eslint-disable-next-line
  },[])

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (page === 1) {
      fetchPhotos();
    }

    console.log("Submitted!");          
    // 经测试后又发现，如果中途变换 query，例如 cat pic -> dog pic，
    // 则 dog pic 会紧跟 cat 的 oldPhotos 显示，而非新开页面。
    // 因此添加一个：
    setPage(1);
    // 由于 page 重置，因此 useEffect 中的 fetchPhotos() 自动执行
    // 所以可以将 fetchPhotos() 去掉。 
    // fetchPhotos(); 

    // 而这将会导致 搜索时，setPage 为 1，
    // 但 page 本身已经为 1，故 default page 不会发生变化。
    // 采取措施：page 的 default value 设置为 0.
    // 这样一来，一旦 query，则 page 产生新的变化，页面 re-render。

    // 而这又会导致一个新 bug:
    // default page 第一次延伸 时, page = 1，此时启动搜索，
    // setPage(1) 并无法触发 useEffect，因此不能 重新 fetch，default page 仍然留存。
    // 因此在 handleSubmit 顶端设置一个：
    // if (page === 1) {
    //   fetchImages();
    // }
  }

  return <main>
    <section className='search'>
      <form className='search-form' onSubmit={handleSubmit}>
        <input 
          className='form-input' 
          type='text' 
          placeholder='search'
          value={query}
          onChange={(e) => {setQuery(e.target.value)}}
        ></input>
        <button type='submit' className='submit-btn'>
          <FaSearch />
        </button>
      </form>
    </section>
    <section className='photos'>
      <div className='photos-center'>
        {photos.map((photo, index) => {
          console.log(photo);
          return <Photo key={index} {...photo} />
        })}
      </div>
      {/* loading 为 true 时加载一个 loading 条 */}
      {loading && <h2 className='loading'>Loading...</h2>}
    </section>
  </main>
}

export default App
