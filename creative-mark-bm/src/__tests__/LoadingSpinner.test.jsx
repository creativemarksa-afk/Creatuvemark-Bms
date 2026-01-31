import { render, screen } from '@testing-library/react';
import LoadingSpinner, { 
  FullPageLoading, 
  InlineLoading, 
  ButtonLoading,
  CardLoading 
} from '@/components/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('renders without text when showText is false', () => {
    render(<LoadingSpinner showText={false} />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    const divElement = container.querySelector('.custom-class');
    expect(divElement).toBeInTheDocument();
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    rerender(<LoadingSpinner size="medium" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    rerender(<LoadingSpinner size="large" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    rerender(<LoadingSpinner size="xlarge" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('FullPageLoading Component', () => {
  it('renders with default text', () => {
    render(<FullPageLoading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<FullPageLoading text="Loading your data..." />);
    expect(screen.getByText('Loading your data...')).toBeInTheDocument();
  });
});

describe('InlineLoading Component', () => {
  it('renders with default props', () => {
    render(<InlineLoading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom text and size', () => {
    render(<InlineLoading text="Processing..." size="small" />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});

describe('ButtonLoading Component', () => {
  it('renders without text', () => {
    render(<ButtonLoading />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders with small size by default', () => {
    const { container } = render(<ButtonLoading />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('CardLoading Component', () => {
  it('renders with default text', () => {
    render(<CardLoading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<CardLoading text="Fetching data..." />);
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });
});

