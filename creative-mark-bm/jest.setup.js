// jest.setup.js
import '@testing-library/jest-dom';

// mock next/image so tests render images as normal <img />
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    const { src, alt, ...rest } = props;
    return <img src={typeof src === 'object' ? src.src : src} alt={alt} {...rest} />;
  },
}));
