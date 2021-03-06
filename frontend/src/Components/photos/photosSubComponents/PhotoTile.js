import React from 'react'
import { Link, withRouter } from 'react-router-dom'
import { Icon, Image } from 'semantic-ui-react'

import { likePhoto, unlikePhoto } from '../../../lib/api'

class PhotoTile extends React.Component {

  state = {
    heartColor: 'grey',
    liked: false
  }

  componentDidMount(){
    const liked = this.props.photo.liked_by.includes(this.props.userProfile.id)
    const heartColor = liked ? 'pink' : 'grey'

    this.setState({
      heartColor,
      liked
    })
  }

  handleClick = async () => {

    const { id } = this.props.photo
    const { liked } = this.state
    if (!liked){
      try {
        await likePhoto(id)
        this.setState({
          heartColor: 'pink',
          liked: true
        })
      } catch (err) {
        console.log(err)
      }
    } else {
      try {
        await unlikePhoto(id)
        this.setState({
          heartColor: 'grey',
          liked: false
        })
      } catch (err) {
        console.error(err)
      }
    }
  }

  render() {
    
    const { image, owner, ownerId, ownerProfileImage, id, title } = this.props.photo
    const { heartColor } = this.state
    return (
      <div className="image-item tile" >
        <Link to={`/photos/${id}`}><img src={ image } alt={title}/></Link>
        <div className='details'>
          <span className='title'>

            <Image 
              className='tile-avatar'
              src={ownerProfileImage}
              avatar
            />
            <Link 
              to={`/profile/${ownerId}`}
              style={{ color: 'white' }}
            >
              {owner}
            </Link>

          </span>
          <div className='heart-btn-container'>
            <Icon
              name='heart'
              size='big'
              color={heartColor}
              onClick={this.handleClick} />
          </div>
        </div>
      </div >
    )
  }

}

export default withRouter(PhotoTile)