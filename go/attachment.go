package generic

// Attachment represents a test output attachment
type Attachment struct {
	Name      string
	MediaType string
	Data      []byte
}

// AttachmentProvider is implemented by types that manage attachments
type AttachmentProvider interface {
	GetAttachments() []Attachment
	ClearAttachments()
}
