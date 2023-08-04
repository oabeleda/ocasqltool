import Modal from 'react-modal';

const customStyles = {
  content: {
    'borderStyle': 'none',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  }
}

const ProgressIndicator = ({ isOpen }) => {

  return (
    <Modal
      style={customStyles}
      isOpen={isOpen}
      contentLabel="Fetching"
    >
      <h3>Running...</h3>
      <progress value={null} />
    </Modal>
  )
}

export default ProgressIndicator