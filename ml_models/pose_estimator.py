import numpy as np
import json

class PoseGenerator:
    def __init__(self):
        # Load sign language pose database
        self.sign_poses = self.load_sign_poses()
        
    def load_sign_poses(self):
        """Load pre-defined poses for common signs"""
        # In production, this would load from a trained model
        # For demo, we'll use predefined pose sequences
        return {
            'HELLO': self.generate_wave_pose(),
            'GO': self.generate_point_pose(),
            'COLLEGE': self.generate_building_pose(),
            'ME': self.generate_self_pose(),
        }
    
    def generate_wave_pose(self):
        """Generate pose sequence for waving"""
        frames = []
        for t in np.linspace(0, 2*np.pi, 30):
            # Right hand wave motion
            frame = {
                'right_arm': {
                    'shoulder': [0, 1, 0],
                    'elbow': [0.2, 0.5, 0],
                    'wrist': [0.5 + 0.2*np.sin(t), 0.3, 0]
                },
                'left_arm': {
                    'shoulder': [0, 1, 0],
                    'elbow': [-0.2, 0.5, 0],
                    'wrist': [-0.5, 0.3, 0]
                }
            }
            frames.append(frame)
        return frames
    
    def generate_point_pose(self):
        """Pointing gesture"""
        frames = []
        for t in np.linspace(0, 1, 15):
            frame = {
                'right_arm': {
                    'shoulder': [0, 1, 0],
                    'elbow': [0.3, 0.4, 0.1],
                    'wrist': [0.8, 0.2, 0.2]
                },
                'left_arm': {
                    'shoulder': [0, 1, 0],
                    'elbow': [-0.3, 0.4, 0],
                    'wrist': [-0.5, 0.3, 0]
                }
            }
            frames.append(frame)
        return frames
    
    def generate_building_pose(self):
        """Represent building/college"""
        frames = []
        for t in np.linspace(0, 1, 15):
            frame = {
                'right_arm': {
                    'shoulder': [0, 1, 0],
                    'elbow': [0, 0.6, 0],
                    'wrist': [0, 0.2, 0.2]
                },
                'left_arm': {
                    'shoulder': [0, 1, 0],
                    'elbow': [0, 0.6, 0],
                    'wrist': [0, 0.2, -0.2]
                }
            }
            frames.append(frame)
        return frames
    
    def generate_self_pose(self):
        """Point to self"""
        frame = {
            'right_arm': {
                'shoulder': [0, 1, 0],
                'elbow': [0, 0.5, 0],
                'wrist': [0, 0.2, 0.1]
            },
            'left_arm': {
                'shoulder': [0, 1, 0],
                'elbow': [-0.1, 0.5, 0],
                'wrist': [-0.2, 0.3, 0]
            }
        }
        return [frame] * 15
    
    def generate_fingerspelling_pose(self, letter):
        """Generate pose for fingerspelling a letter"""
        # Map letters to hand shapes
        letter_shapes = {
            'A': {'thumb': 0.5, 'index': 0, 'middle': 0, 'ring': 0, 'pinky': 0},
            'B': {'thumb': 0, 'index': 1, 'middle': 1, 'ring': 1, 'pinky': 1},
            # Add more letters...
        }
        
        shape = letter_shapes.get(letter.upper(), {'thumb': 0.5, 'index': 0.5, 'middle': 0.5, 'ring': 0.5, 'pinky': 0.5})
        
        frame = {
            'right_hand': shape,
            'left_hand': {'thumb': 0, 'index': 0, 'middle': 0, 'ring': 0, 'pinky': 0}
        }
        return [frame] * 10
    
    def text_to_pose_sequence(self, words):
        """Convert text words to pose sequence"""
        pose_sequence = []
        
        for word in words:
            word_upper = word.upper()
            
            if word_upper in self.sign_poses:
                # Use predefined sign
                pose_sequence.extend(self.sign_poses[word_upper])
            else:
                # Fingerspell unknown words
                for letter in word_upper:
                    pose_sequence.extend(self.generate_fingerspelling_pose(letter))
            
            # Add transition between signs
            pose_sequence.extend(self.generate_transition())
        
        return pose_sequence
    
    def generate_transition(self):
        """Generate neutral transition pose"""
        neutral = {
            'right_arm': {'shoulder': [0, 1, 0], 'elbow': [0, 0.5, 0], 'wrist': [0, 0.2, 0]},
            'left_arm': {'shoulder': [0, 1, 0], 'elbow': [0, 0.5, 0], 'wrist': [0, 0.2, 0]}
        }
        return [neutral] * 5

# Initialize globally
pose_generator = PoseGenerator()

def text_to_poses(words):
    """Main function to convert text to pose sequence"""
    return pose_generator.text_to_pose_sequence(words)