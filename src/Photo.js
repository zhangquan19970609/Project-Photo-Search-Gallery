// 较大型 External API data 的 destructure

import React from 'react'

const Photo = ({
  urls:{regular}, 
  likes,
  alt_description,
  user:{name, portfolio_url, profile_image:{medium}}, 
}) => {
  return <article className='photo'>
    <img src={regular} alt={alt_description} />
    <div className='photo-info'>
      <div>
        <h4>{name}</h4>
        <p>{likes} likes</p>
      </div>
      <a href={portfolio_url}>
        <img src={medium} className="user-img" alt={name} />
      </a>
    </div>
  </article>
}

export default Photo
