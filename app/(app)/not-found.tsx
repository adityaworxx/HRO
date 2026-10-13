import Link from 'next/link';
import { EmptyState } from '@/components/hro/empty-state';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="py-12">
      <EmptyState
        icon={FileQuestion}
        title="Page Not Found (404)"
        description="The route or resource you requested could not be located."
        action={
          <Button variant="primary" asChild>
            <Link href="/">Return to Dashboard</Link>
          </Button>
        }
      />
    </div>
  );
}
